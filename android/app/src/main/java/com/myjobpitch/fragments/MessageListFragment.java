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

    Job job;
    JobSeeker jobSeeker;

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, getString(R.string.applications_empty_text), R.layout.cell_message_list);

        // header view, loading data

        title = getString(R.string.messages_title);

        if (job != null) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        } else {
            updateMessage();
        }

        return view;
    }

    public void updateMessage() {
    }


    @Override
    protected List<Application> getApplications() {
        Integer jobseekerId = AppData.user.getJob_seeker();
        if (jobseekerId != null) {
            jobSeeker = MJPApi.shared().get(JobSeeker.class, jobseekerId);
            if (jobSeeker.getPitch() == null) {
                return new ArrayList<>();
            }
        }

       List<Application> appApplicationsList = new ArrayList();
       List<Application> applications = new ArrayList();

        String query = job != null ? "job=" + job.getId() : null;
        appApplicationsList.addAll(MJPApi.shared().get(Application.class, query));

        for (Application application : appApplicationsList) {
            if (application.getMessages().size() != 0) {
                applications.add(application);
            }
        }
        return applications;
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {

        if (application.getMessages().size() != 0) {

            Message lastMessage = application.getMessages().get(application.getMessages().size() - 1);
            Job job = application.getJob_data();

            if (AppData.user.isJobSeeker()) {
                AppHelper.loadJobLogo(job, AppHelper.getImageView(view));
                setItemTitle(view, job.getTitle());
                setItemSubTitle(view, AppHelper.getBusinessName(job));
            } else {
                JobSeeker jobSeeker = application.getJob_seeker();
                AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(view));
                setItemTitle(view, AppHelper.getJobSeekerName(jobSeeker));
                setItemSubTitle(view, String.format("%s, (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
            }

            SimpleDateFormat format = new SimpleDateFormat("MMM d, h:mm a");
            setItemAttributes(view, format.format(lastMessage.getCreated()));

            if (lastMessage.getFrom_role() == AppData.userRole) {
                setItemDesc(view, "You: " + lastMessage.getContent());
            } else {
                setItemDesc(view, lastMessage.getContent());
            }

            AppHelper.getEditButton(view).setVisibility(View.GONE);
            AppHelper.getRemoveButton(view).setVisibility(View.GONE);
        }

    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 105) {
            getApp().setRootFragement(R.id.menu_messages);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    @Override
    protected void selectedApplication(Application application) {
        final Application selectedApplication = application;

        if (AppData.user.isJobSeeker()) {
            new APITask(() -> {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
//                    AppData.existProfile = jobSeeker.getProfile() != null;
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    if (!jobSeeker.isActive()) {
                        Popup popup = new Popup(getContext(), R.string.to_message_account_activate, true);
                        popup.addGreenButton(R.string.activate, view -> {

                            TalentProfileFragment fragment = new TalentProfileFragment();
                            getApp().pushFragment(fragment);
                        });
                        popup.addGreyButton(R.string.cancel, v -> {
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
                Popup popup = new Popup(getContext(), R.string.to_message_activate_job, true);
                popup.addGreenButton(R.string.activate, view -> {
                    JobEditFragment fragment = new JobEditFragment();
                    fragment.job = selectedJob;
                    fragment.activation = true;
                    getApp().pushFragment(fragment);
                });
                popup.addGreyButton(R.string.cancel, v -> {
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

            new APITask(() -> MJPApi.shared().update(MessageForUpdate.class, messageForUpdate)).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                }

                @Override
                public void onError(JsonNode errors) {
                }
            }).execute();
        }
    }

}
