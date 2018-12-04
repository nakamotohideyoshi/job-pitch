package com.myjobpitch.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.ImageButton;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.activities.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Jobseeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import org.apache.commons.lang3.SerializationUtils;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class TalentDetailsFragment extends BaseFragment {

    @BindView(R.id.jobseeker_image_view)
    View imageView;

    @BindView(R.id.jobseeker_name)
    TextView nameView;

    @BindView(R.id.jobseeker_subtitle)
    TextView subTitleView;

    @BindView(R.id.jobseeker_pitch_play)
    View playButton;

    @BindView(R.id.jobseeker_desc)
    TextView descView;

    @BindView(R.id.jobseeker_cv)
    Button cvButton;

    @BindView(R.id.jobseeker_national_number)
    View nationalNumberView;
    @BindView(R.id.jobseeker_available)
    View availableView;
    @BindView(R.id.jobseeker_truthful)
    View truthfulView;

    @BindView(R.id.jobseeker_contact_view)
    View contactView;
    @BindView(R.id.jobseeker_contact)
    TextView contactInfoView;
    @BindView(R.id.shortlisted)
    CheckBox shortlistedView;

    @BindView(R.id.connect_help)
    ImageButton connectHelpButton;
    @BindView(R.id.apply_button)
    Button applyButton;
    @BindView(R.id.remove_button)
    Button removeButton;

    private boolean connected;

    public boolean viewMode = false;

    public Application application;
    public List<Application> applications;
    public Jobseeker jobseeker;
    public Job job;
    public Action action;
    private Interview interview;
    private Boolean isOpenInterview = false;

    public interface Action {
        void apply(Job job);
        void remove();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_talent_details, container, false);
        ButterKnife.bind(this, view);

        if (application != null) {
            jobseeker = application.getJob_seeker();
            connected = application.getStatus() == ApplicationStatus.ESTABLISHED_ID;

            loadApplications();

        }

        if (AppData.user.isJobseeker()) {
            title = "Profile";
            viewMode = true;
            addMenuItem(MENUGROUP2, 100, "Edit", R.drawable.ic_edit);
        } else {
            title = "Talent Details";
        }

        if (jobseeker == null) {
            jobseeker = AppData.jobseeker;
        }

        load();

        return view;
    }

    private void loadApplications() {
        applications = new ArrayList();
        new APITask(new APIAction() {
            @Override
            public void run() {
                String query = "job=" + application.getJob() + "&status=" + application.getStatus();
                query += application.getShortlisted() ? "&shortlisted=1" : "&shortlisted=0";
                applications.addAll(MJPApi.shared().get(Application.class, query));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                for (Application jobApplication : applications) {
                    if (jobApplication.getId().intValue() == application.getId().intValue()) {
                        application = jobApplication;
                        break;
                    }
                }

                if (AppData.user.isRecruiter()) {
                    isOpenInterview = false;
                    for (Interview applicationInterview : application.getInterviews()) {
                        if (applicationInterview.getStatus().equals(InterviewStatus.PENDING) || applicationInterview.getStatus().equals(InterviewStatus.ACCEPTED)) {
                            interview = applicationInterview;
                            interview.setApplication(application.getId());
                            isOpenInterview = true;
                            break;
                        }
                    }
                    if (connected) {
                        if (isOpenInterview) {
                            applyButton.setText("Pending Interview");
                        } else {
                            applyButton.setText("Arrange Interview");
                        }
                    }
                }

            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void load() {

        AppHelper.loadJobseekerImage(jobseeker, AppHelper.getImageView(imageView));

        nameView.setText(AppHelper.getJobseekerName(jobseeker));
        Sex sex = AppData.getObjById(AppData.sexes, jobseeker.getSex());

        String subTitle = "";
        if (jobseeker.getAge() != null && jobseeker.getAge_public()) {
            subTitle = jobseeker.getAge().toString() + " ";
        }
        if (sex != null && jobseeker.getSex_public()) {
            subTitle += sex.getShort_name();
        }
        subTitleView.setText(subTitle);

        descView.setText(jobseeker.getDescription());

        playButton.setVisibility(jobseeker.getPitch() != null ? View.VISIBLE : View.GONE);
        nationalNumberView.setVisibility(jobseeker.getNational_insurance_number() == null && !jobseeker.getHas_national_insurance_number()? View.GONE : View.VISIBLE);
        availableView.setVisibility(jobseeker.getHas_references() ? View.VISIBLE : View.GONE);
        truthfulView.setVisibility(jobseeker.getTruth_confirmation() ? View.VISIBLE : View.GONE);

        if (connected) {

            if (jobseeker.getCV() == null) {
                cvButton.setVisibility(View.GONE);
            }

            String contact = "";
            if (jobseeker.getEmail_public()) {
                contact += jobseeker.getEmail() + "\n";
            }
            if (jobseeker.getMobile() != null && !jobseeker.getMobile().isEmpty() && jobseeker.getMobile_public()) {
                contact += jobseeker.getMobile() + "\n";
            }
            if (!contact.isEmpty()) {
                contactInfoView.setText(contact);
            } else {
                contactInfoView.setText("No contact details supplied");
            }

            shortlistedView.setChecked(application.getShortlisted());
            shortlistedView.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    showLoading();
                    new APITask(new APIAction() {
                        @Override
                        public void run() {
                            application.setShortlisted(shortlistedView.isChecked());
                            ApplicationShortlistUpdate update = new ApplicationShortlistUpdate(application);
                            MJPApi.shared().updateApplicationShortlist(update);
                        }
                    }).addListener(new APITaskListener() {
                        @Override
                        public void onSuccess() {
                            hideLoading();
                        }
                        @Override
                        public void onError(JsonNode errors) {
                            errorHandler(errors);
                        }
                    }).execute();

                }
            });

            connectHelpButton.setVisibility(View.GONE);

            if (application.getMessages().size() == 0) {
                applyButton.setVisibility(View.GONE);
            }

        } else {

            contactView.setVisibility(View.GONE);

            cvButton.setVisibility(jobseeker.getCV() != null ? View.VISIBLE : View.GONE);
            if (AppData.user.isJobseeker()) {
                applyButton.setVisibility(View.GONE);
                removeButton.setVisibility(View.GONE);
                connectHelpButton.setVisibility(View.GONE);
            } else {
                applyButton.setText("Connect");
            }

        }

        if (viewMode) {
            applyButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.GONE);
        }

    }

    @OnClick(R.id.jobseeker_pitch_play)
    void onPitchPlay() {
        Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
        intent.putExtra(MediaPlayerActivity.PATH, jobseeker.getPitch().getVideo());
        startActivity(intent);
    }

    @OnClick(R.id.jobseeker_cv)
    void onViewCV() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(jobseeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.connect_help)
    void onConnectHelp() {
        new Popup(getContext())
                .setMessage("Hit connect to view full talent detail and CV (if available). Talent will be added to your connection list where you can shortlist them, and start messaging.\n(1 credit/connection)")
                .addGreyButton("Close", null)
                .show();
    }

    @OnClick(R.id.apply_button)
    void onApply() {
        if (connected) {

            if (AppData.user.isJobseeker()) {
                MessageFragment fragment = new MessageFragment();
                fragment.application = application;
                getApp().pushFragment(fragment);
            } else {
                if (isOpenInterview) {
                    InterviewDetailsFragment fragment = new InterviewDetailsFragment();
                    fragment.interviewId = interview.getId();
                    fragment.application = application;
                    getApp().pushFragment(fragment);
                } else {
                    InterviewEditFragment fragment = new InterviewEditFragment();
                    fragment.application = application;
                    fragment.mode = "NEW";
                    getApp().pushFragment(fragment);
                }
            }
        } else {
            String message = application == null ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?";
            new Popup(getContext())
                    .setMessage(message)
                    .addYellowButton("Connect (1 credit)", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            new APITask(new APIAction() {
                                @Override
                                public void run() {
                                    if (application == null) {

                                        ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                                        applicationForCreation.setJob(job.getId());
                                        applicationForCreation.setJob_seeker(jobseeker.getId());
                                        applicationForCreation.setShortlisted(false);
                                        ApplicationForCreation applicationForCreation1 = MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                                        application = MJPApi.shared().get(Application.class, applicationForCreation1.getId());

                                    } else {

                                        Application application1 = SerializationUtils.clone(application);
                                        application1.setStatus(ApplicationStatus.ESTABLISHED_ID);
                                        ApplicationStatusUpdate applicationStatusUpdate1 = new ApplicationStatusUpdate(application1);
                                        MJPApi.shared().updateApplicationStatus(applicationStatusUpdate1);

                                    }
                                }
                            }).addListener(new APITaskListener() {
                                @Override
                                public void onSuccess() {
                                    if (action != null) {
                                        action.apply(application.getJob_data());
                                    }
                                    getApp().popFragment();
                                }
                                @Override
                                public void onError(JsonNode errors) {
                                    if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                        hideLoading();
                                        new Popup(getContext())
                                                .setMessage("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.")
                                                .addGreyButton("Ok", null)
                                                .show();
                                    } else {
                                        errorHandler(errors);
                                    }
                                }
                            }).execute();


                        }
                    })
                    .addGreyButton("Cancel", null)
                    .show();
        }
    }

    @OnClick(R.id.remove_button)
    void onRemove() {
        String message = application == null ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?";
        new Popup(getContext())
                .setMessage(message)
                .addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        if (action != null) {
                            action.remove();
                            getApp().popFragment();
                        } else {
                            showLoading();
                            new APITask(new APIAction() {
                                @Override
                                public void run() {
                                    MJPApi.shared().delete(Application.class, application.getId());
                                }
                            }).addListener(new APITaskListener() {
                                @Override
                                public void onSuccess() {
                                    getApp().popFragment();
                                }
                                @Override
                                public void onError(JsonNode errors) {
                                    errorHandler(errors);
                                }
                            }).execute();


                        }
                    }
                })
                .addGreyButton("Cancel", null)
                .show();
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            TalentProfileFragment fragment = new TalentProfileFragment();
            getApp().pushFragment(fragment);
        }
    }

}