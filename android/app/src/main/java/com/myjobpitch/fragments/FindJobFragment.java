package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

public class FindJobFragment extends SwipeFragment<Job> {

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
                getApp().setRootFragement(R.id.menu_record);
            }
        });

//        if (AppData.jobseeker != null) {
//            showInactiveBanner();
//        }

        return  view;
    }

    @Override
    protected void loadData() {
        final List<Job> data = new ArrayList<>();

        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() {
                data.addAll(MJPApi.shared().get(Job.class));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
//                showInactiveBanner();

                checkJobseekerPitch();

                setData(data);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void checkJobseekerPitch() {
        if (AppData.jobseeker.getPitch() == null && AppData.jobseeker.getProfile_thumb() == null) {
            new Popup(getContext())
                    .setMessage("You cannot yet be found by potential employers until you complete your profile photo or job pitch.")
                    .addYellowButton("Edit Profile", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            getApp().setRootFragement(R.id.menu_user_profile);
                        }
                    })
                    .addGreenButton("Continue", null)
                    .show();
        }
    }

//    void showInactiveBanner() {
//        if (!jobseeker.isActive()) {
//            AppHelper.setJobTitleViewText(jobTitleView, "Your profile is not active!");
//        } else {
//            AppHelper.setJobTitleViewText(jobTitleView, "");
//        }
//    }

    @Override
    protected void showDeckInfo(Job job, View view) {
        AppHelper.loadJobLogo(job, getCardImageContainer(view));
        setCardTitle(view, job.getTitle());
        setCardDesc(view, job.getDescription());

        Workplace workplace = job.getLocation_data();
        String distance = AppHelper.distance(AppData.profile.getLatitude(), AppData.profile.getLongitude(), workplace.getLatitude(), workplace.getLongitude());
        ((TextView)view.findViewById(R.id.distance)).setText(distance);

        ((TextView)view.findViewById(R.id.right_mark_text)).setText("Apply");
    }

    void showProfile() {
        cardStack.unSwipeCard();
        TalentProfileFragment fragment = new TalentProfileFragment();
        getApp().pushFragment(fragment);
    }

    @Override
    protected void swipedRight(final Job job) {

        if (!AppData.jobseeker.isActive()) {
            new Popup(getContext())
                    .setMessage("To apply please activate your account")
                    .addGreenButton("Activate", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            showProfile();
                        }
                    })
                    .addGreyButton("Cancel", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            cardStack.unSwipeCard();
                        }
                    })
                    .show();
            return;
        }

        if (AppData.jobseeker.getProfile_image() == null) {
            new Popup(getContext())
                    .setMessage("To apply please set your photo")
                    .addGreenButton("Edit profile", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            showProfile();
                        }
                    })
                    .addGreyButton("Cancel", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            cardStack.unSwipeCard();
                        }
                    })
                    .show();
            return;
        }

        if (job.getRequires_cv() && AppData.jobseeker.getCV() == null) {
            new Popup(getContext())
                    .setMessage("Looks like this job wants you to upload a full CV before applying! You can upload a PDF or document to your profile.")
                    .addGreenButton("Edit profile", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            showProfile();
                        }
                    })
                    .addGreyButton("Cancel", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            cardStack.unSwipeCard();
                        }
                    })
                    .show();
            return;
        }

        cardStack.unSwipeCard();
        JobApplyFragment fragment = new JobApplyFragment();
        fragment.job = job;
        fragment.callback = new JobApplyFragment.Callback() {
            @Override
            public void completed() {
                topCardItemId++;
            }
        };
        getApp().pushFragment(fragment);

    }

    @Override
    protected void selectedCard(Job job) {
        ApplicationDetailsFragment fragment = new ApplicationDetailsFragment();
        fragment.job = job;
        fragment.action = new ApplicationDetailsFragment.Action() {
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
            getApp().setRootFragement(R.id.menu_messages);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    @Override
    protected void goToEditProfile() {
        TalentProfileFragment fragment = new TalentProfileFragment();
        getApp().pushFragment(fragment);
    }

}
