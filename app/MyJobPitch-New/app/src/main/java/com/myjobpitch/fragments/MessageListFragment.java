package com.myjobpitch.fragments;

import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.api.data.MessageForUpdate;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;

public class MessageListFragment extends ApplicationsFragment {

    View noPitchView;
    Job job;
    JobSeeker jobSeeker;

    @BindView(R.id.job_title_view)
    View jobTitleView;

    Handler indicationHandler = new Handler();

    Runnable indicationTimerRunnable = new Runnable() {
        @Override
        public void run() {
            updateMessage();
            indicationHandler.postDelayed(this, 10000);
        }
    };

    public void startChecking() {
        indicationHandler.postDelayed(indicationTimerRunnable, 0);
    }

    public  void stopChecking() {
        indicationHandler.removeCallbacks(indicationTimerRunnable);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, "You have no applications.", R.layout.cell_message_list);

        noPitchView = view.findViewById(R.id.nopitch_view);
        view.findViewById(R.id.go_record_now).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
            }
        });

        // header view, loading data

        title = "Messages";

        if (job != null) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
            addMenuItem(MENUGROUP1, 105, "All Messages", R.drawable.menu_message);
        } else {
            AppHelper.setJobTitleViewText(jobTitleView, "All Messages");
            startChecking();
        }

        return view;
    }

    public void updateMessage() {
        long newMessageCount = getApp().newMessageCount;
        if (newMessageCount > 0) {
            updateMessage(getApp().lastMessage);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        stopChecking();
    }


    @Override
    protected List<Application> getApplications() throws MJPApiException {
        Integer jobseekerId = AppData.user.getJob_seeker();
        if (jobseekerId != null) {
            jobSeeker = MJPApi.shared().get(JobSeeker.class, jobseekerId);
            if (jobSeeker.getPitch() == null) {
                Handler mainHandler = new Handler(MessageListFragment.this.getContext().getMainLooper());

                Runnable myRunnable = new Runnable() {
                    @Override
                    public void run() {
                        noPitchView.setVisibility(View.VISIBLE);
                    }
                };
                mainHandler.post(myRunnable);
                return new ArrayList<>();
            }
        }

        String query = job != null ? "job=" + job.getId() : null;
        return MJPApi.shared().get(Application.class, query);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {

        Message lastMessage = application.getMessages().get(application.getMessages().size()-1);
        Job job = application.getJob_data();

        if (AppData.user.isJobSeeker()) {
            AppHelper.loadJobLogo(job, AppHelper.getImageView(view));
            setItemTitle(view, job.getTitle());
            setItemSubTitle(view, AppHelper.getBusinessName(job));
        } else {
            JobSeeker jobSeeker = application.getJobSeeker();
            AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(view));
            setItemTitle(view, AppHelper.getJobSeekerName(jobSeeker));
            setItemSubTitle(view, String.format("%s, (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        }

        SimpleDateFormat format = new SimpleDateFormat("MMM d, h:mm a");
        setItemAttributes(view, format.format(lastMessage.getCreated()));

        if (lastMessage.getFrom_role() == AppData.getUserRole().getId()) {
            setItemDesc(view, "You: " + lastMessage.getContent());
        } else {
            setItemDesc(view, lastMessage.getContent());
        }

        AppHelper.getEditButton(view).setVisibility(View.GONE);
        AppHelper.getRemoveButton(view).setVisibility(View.GONE);


    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 105) {
            getApp().setRootFragement(AppData.PAGE_MESSAGES);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    @Override
    protected void selectedApplication(Application application) {
        final Application selectedApplication = application;

        if (AppData.user.isJobSeeker()) {
            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    AppData.existProfile = jobSeeker.getProfile() != null;
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    if (!jobSeeker.isActive()) {
                        Popup popup = new Popup(getContext(), "To message please activate your account", true);
                        popup.addGreenButton("Activate", new View.OnClickListener() {
                            @Override
                            public void onClick(View view) {

                                TalentProfileFragment fragment = new TalentProfileFragment();
                                fragment.jobSeeker = jobSeeker;
                                fragment.isActivation = true;
                                getApp().pushFragment(fragment);
                            }
                        });
                        popup.addGreyButton("Cancel", new View.OnClickListener() {
                            @Override
                            public void onClick(View v) {
                            }
                        });
                        popup.show();
                    } else {
                        MessageFragment fragment = new MessageFragment();
                        fragment.application = selectedApplication;
                        getApp().pushFragment(fragment);
                    }
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        } else {

            final Job selectedJob = application.getJob_data();
            if (selectedJob.getStatus() == 2) {
                Popup popup = new Popup(getContext(), "To message please activate your job", true);
                popup.addGreenButton("Activate", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        JobEditFragment fragment = new JobEditFragment();
                        fragment.job = selectedJob;
                        fragment.activation = true;
                        getApp().pushFragment(fragment);
                    }
                });
                popup.addGreyButton("Cancel", new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                    }
                });
                popup.show();
            } else {
                MessageFragment fragment = new MessageFragment();
                fragment.application = application;
                getApp().pushFragment(fragment);
            }
        }
    }

    void updateMessage(Message message) {
        if (message != null) {
            final MessageForUpdate messageForUpdate = new MessageForUpdate();
            messageForUpdate.setId(message.getId());
            messageForUpdate.setRead(true);

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    MJPApi.shared().update(MessageForUpdate.class, messageForUpdate);
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    getApp().newMessageCount = 0;
                }

                @Override
                public void onError(JsonNode errors) {
                }
            }).execute();
        }
    }

}
