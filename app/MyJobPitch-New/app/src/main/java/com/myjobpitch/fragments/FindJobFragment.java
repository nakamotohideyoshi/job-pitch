package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import java.util.List;

public class FindJobFragment extends SwipeFragment<Job> {

    JobSeeker jobSeeker;
    JobProfile profile;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, "There are no more jobs that match your profile. You can restore your removed matches by clicking refresh above.");
        title = "Find Job";
        creditsView.setVisibility(View.GONE);
        return  view;
    }

    @Override
    protected void loadData() {

        new APITask("Loading...", this) {
            private List<Job> data;
            @Override
            protected void runAPI() throws MJPApiException {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
                data = MJPApi.shared().get(Job.class);
            }
            @Override
            protected void onSuccess() {
                setData(data);
            }
        };

    }

    @Override
    protected void showDeckInfo(Job job, View view) {
        AppHelper.loadJobLogo(job, getCardImageContainer(view));
        setCardTitle(view, job.getTitle());
        setCardDesc(view, job.getDescription());
    }

    @Override
    protected void swipedRight(final Job job) {
        if (jobSeeker.getPitch() == null) {
            Popup.showGreen("You need to record your pitch video to apply.", "Record my pitch", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
                }
            }, "Cancel", new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    cardStack.unSwipeCard();
                }
            }, true);
        } else {
            new APITask(new APITask.ErrorListener() {
                @Override
                public void onError(MJPApiException e) {
                    cardStack.unSwipeCard();
                }
            }) {
                @Override
                protected void runAPI() throws MJPApiException {
                    ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                    applicationForCreation.setJob(job.getId());
                    applicationForCreation.setJob_seeker(jobSeeker.getId());
                    applicationForCreation.setShortlisted(false);
                    MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                }
                @Override
                protected void onSuccess() {
                }
            };
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

}
