package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

public class FindJobFragment extends SwipeFragment<Job> {

    JobSeeker jobSeeker;
    JobProfile profile;
    View noPitchView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, "There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above.");
        title = "Find Job";
        creditsView.setVisibility(View.GONE);

        noPitchView = view.findViewById(R.id.nopitch_view);
        view.findViewById(R.id.go_record_now).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
            }
        });

        if (jobSeeker != null) {
            showInactiveBanner();
        }

        return  view;
    }

    @Override
    protected void loadData() {
        final List<Job> data = new ArrayList<>();

        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
                data.addAll(MJPApi.shared().get(Job.class));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                showInactiveBanner();

                if (jobSeeker.getPitch() == null) {
                    noPitchView.setVisibility(View.VISIBLE);
                } else {
                    setData(data);
                }
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void showInactiveBanner() {
        if (!jobSeeker.isActive()) {
            AppHelper.setJobTitleViewText(jobTitleView, "Your profile is not active!");
        } else {
            AppHelper.setJobTitleViewText(jobTitleView, "");
        }
    }

    @Override
    protected void showDeckInfo(Job job, View view) {
        AppHelper.loadJobLogo(job, getCardImageContainer(view));
        setCardTitle(view, job.getTitle());
        setCardDesc(view, job.getDescription());

        Location location = job.getLocation_data();
        String distance = AppHelper.distance(profile.getLatitude(), profile.getLongitude(), location.getLatitude(), location.getLongitude());
        ((TextView)view.findViewById(R.id.distance)).setText(distance);

        ((TextView)view.findViewById(R.id.right_mark_text)).setText("Apply");
    }

    @Override
    protected void swipedRight(final Job job) {
        if (!jobSeeker.isActive()) {
            cardStack.unSwipeCard();
            Popup popup = new Popup(getContext(), "To apply please activate your account", true);
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
            if (jobSeeker.getPitch() == null) {
                Popup popup = new Popup(getContext(), "You need to record your pitch video to apply.", true);
                popup.addGreenButton("Record my pitch", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
                    }
                });
                popup.addGreyButton("Cancel", new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        cardStack.unSwipeCard();
                    }
                });
                popup.show();
            } else {
                new APITask(new APIAction() {
                    @Override
                    public void run() throws MJPApiException {
                        ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                        applicationForCreation.setJob(job.getId());
                        applicationForCreation.setJob_seeker(jobSeeker.getId());
                        applicationForCreation.setShortlisted(false);
                        MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                    }
                }).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {

                    }

                    @Override
                    public void onError(JsonNode errors) {
                        cardStack.unSwipeCard();
                    }
                }).execute();
            }
        }
    }

    @Override
    protected void selectedCard(Job job) {
        ApplicationDetailFragment fragment = new ApplicationDetailFragment();
        fragment.job = job;
        fragment.action = new ApplicationDetailFragment.Action() {
            @Override
            public void apply() {
                topCardItemId++;
            }
            @Override
            public void remove() {
                topCardItemId++;
            }
        };
        getApp().pushFragment(fragment);
    }

    @Override
    public void onMenuSelected(int menuID) {

        if (menuID == 108) {
            getApp().setRootFragement(AppData.PAGE_MESSAGES);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    @Override
    protected void goToEditProfile() {
        TalentProfileFragment fragment = new TalentProfileFragment();
        fragment.jobSeeker = jobSeeker;
        fragment.isActivation = true;
        getApp().pushFragment(fragment);
    }

}
