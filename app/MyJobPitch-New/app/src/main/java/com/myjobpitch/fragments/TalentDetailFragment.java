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
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import org.apache.commons.lang3.SerializationUtils;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class TalentDetailFragment extends BaseFragment {

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
    public JobSeeker jobSeeker;
    public Job job;
    public Action action;

    public interface Action {
        void apply();
        void remove();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_talent_detail, container, false);
        ButterKnife.bind(this, view);

        title = "Talent Detail";

        if (application != null) {
            jobSeeker = application.getJobSeeker();
            connected = application.getStatus() == AppData.get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
        }

        load();

        return view;
    }

    void load() {

        AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(imageView));

        nameView.setText(AppHelper.getJobSeekerName(jobSeeker));
        Sex sex = AppData.get(Sex.class, jobSeeker.getSex());

        String subTitle = "";
        if (jobSeeker.getAge() != null && jobSeeker.getAge_public()) {
            subTitle = jobSeeker.getAge().toString() + " ";
        }
        if (sex != null && jobSeeker.getSex_public()) {
            subTitle += sex.getShort_name();
        }
        subTitleView.setText(subTitle);

        descView.setText(jobSeeker.getDescription());

        if (jobSeeker.getPitch() == null) {
            playButton.setVisibility(View.GONE);
        }

        if (!jobSeeker.getHasReferences()) {
            availableView.setVisibility(View.GONE);
        }

        if (!jobSeeker.getTruthConfirmation()) {
            truthfulView.setVisibility(View.GONE);
        }

        if (connected) {
            if (jobSeeker.getCV() == null) {
                cvButton.setVisibility(View.GONE);
            }

            String contact = "";
            if (jobSeeker.getEmail_public()) {
                contact += jobSeeker.getEmail() + "\n";
            }
            if (jobSeeker.getMobile() != null && !jobSeeker.getMobile().isEmpty() && jobSeeker.getMobile_public()) {
                contact += jobSeeker.getMobile() + "\n";
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
                    changedShortlist();
                }
            });

            connectHelpButton.setVisibility(View.GONE);

        } else {
            cvButton.setVisibility(View.GONE);
            contactView.setVisibility(View.GONE);

            Job j = job
                    != null ? job : application.getJob_data();
            int creditCount = j.getLocation_data().getBusiness_data().getTokens();
            String credits = creditCount > 1 ? " credits" : " credit";
            applyButton.setText(String.format("Connect  (%d %s)", creditCount, credits));
        }

        if (viewMode) {
            applyButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.GONE);
        }

    }

    void changedShortlist() {
        application.setShortlisted(shortlistedView.isChecked());
        final ApplicationShortlistUpdate update = new ApplicationShortlistUpdate(application);

        new APITask("Updating...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                MJPApi.shared().updateApplicationShortlist(update);
            }
            @Override
            protected void onSuccess() {
            }
        };

    }

    @OnClick(R.id.jobseeker_pitch_play)
    void onPitchPlay() {
        Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
        intent.putExtra(MediaPlayerActivity.PATH, jobSeeker.getPitch().getVideo());
        startActivity(intent);
    }

    @OnClick(R.id.jobseeker_cv)
    void onViewCV() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(jobSeeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.connect_help)
    void onConnectHelp() {
        Popup.showGreen("Hit connect to view full talent detail and CV (if available). Talent will be added to your connection list where you can shortlist them, and start messaging.\n(1 credit/connection)", null, null, "Close", null, true);
    }

    @OnClick(R.id.apply_button)
    void onApply() {
        if (connected) {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        } else {
            String message = application == null ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?";
            Popup.showYellow(message, "Connect", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (application == null) {

                        new APITask("", new APITask.ErrorListener() {
                            @Override
                            public void onError(MJPApiException e) {
                                JsonNode errors = e.getErrors();
                                if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                    Popup.showError("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                                }
                            }
                        }) {
                            @Override
                            protected void runAPI() throws MJPApiException {
                                final ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                                applicationForCreation.setJob(job.getId());
                                applicationForCreation.setJob_seeker(jobSeeker.getId());
                                applicationForCreation.setShortlisted(false);
                                ApplicationForCreation applicationForCreation1 = MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                                application = MJPApi.shared().get(Application.class, applicationForCreation1.getId());
                            }
                            @Override
                            protected void onSuccess() {
                                action.apply();
                                getApp().popFragment();
                            }
                        };

                    } else {

                        new APITask("", new APITask.ErrorListener() {
                            @Override
                            public void onError(MJPApiException e) {
                                JsonNode errors = e.getErrors();
                                if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                    Popup.showError("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                                }
                            }
                        }) {
                            @Override
                            protected void runAPI() throws MJPApiException {
                                Integer established = AppData.get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
                                Application application1 = SerializationUtils.clone(application);
                                application1.setStatus(established);
                                ApplicationStatusUpdate applicationStatusUpdate1 = new ApplicationStatusUpdate(application1);
                                MJPApi.shared().updateApplicationStatus(applicationStatusUpdate1);
                            }
                            @Override
                            protected void onSuccess() {
                                getApp().popFragment();
                            }
                        };

                    }
                }
            }, "Cancel", null, true);
        }
    }

    @OnClick(R.id.remove_button)
    void onRemove() {
        String message = application == null ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?";
        Popup.showYellow(message, "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (application == null) {
                    action.remove();
                    getApp().popFragment();
                } else {
                    new APITask("Deleting...", TalentDetailFragment.this) {
                        @Override
                        protected void runAPI() throws MJPApiException {
                            MJPApi.shared().delete(Application.class, application.getId());
                        }
                        @Override
                        protected void onSuccess() {
                            getApp().popFragment();
                        }
                    };
                }
            }
        }, "Cancel", null, true);
    }

}
