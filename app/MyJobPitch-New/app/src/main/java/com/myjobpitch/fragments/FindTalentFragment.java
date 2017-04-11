package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.CreateApplication;
import com.myjobpitch.tasks.TaskListener;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import java.util.List;

public class FindTalentFragment extends SwipeFragment<JobSeeker> {

    public Job job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, "There are no more new matches for this job. You can restore your removed matches by clicking refresh above.");
        title = "Find Talent";
        return  view;
    }

    private void showCredits() {
        if (job != null) {
            int creditCount = job.getLocation_data().getBusiness_data().getTokens();
            creditsView.setText(creditCount + (creditCount > 1 ? " credits" : " credit"));
        }
    }

    @Override
    protected void loadData() {
        new APITask("Loading...", this) {
            List<JobSeeker> data;
            @Override
            protected void runAPI() throws MJPApiException {
                job = MJPApi.shared().getUserJob(job.getId());
                data = MJPApi.shared().get(JobSeeker.class, "job=" + job.getId());
            }
            @Override
            protected void onSuccess() {
                showCredits();
                setData(data);
            }
        };
    }

    @Override
    protected void showDeckInfo(JobSeeker jobSeeker, View view) {
        AppHelper.loadJobSeekerImage(jobSeeker, getCardImageContainer(view));
        setCardTitle(view, AppHelper.getJobSeekerName(jobSeeker));
        setCardDesc(view, jobSeeker.getDescription());
    }

    @Override
    protected void swipedRight(JobSeeker jobSeeker) {
        new CreateApplication(job.getId(), jobSeeker.getId(), new TaskListener<Application>() {
            @Override
            public void done(Application application) {
                if (application != null) {
                    int creditCount = application.getJob_data().getLocation_data().getBusiness_data().getTokens();
                    creditsView.setText(creditCount + (creditCount > 1 ? " credits" : " credit"));
                }
            }
            @Override
            public void error(String error) {
                cardStack.unSwipeCard();
                if (error.equals("NO_TOKENS")) {
                    Popup.showError("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                }
            }
        });
    }

    @Override
    protected void selectedCard(JobSeeker jobSeeker) {
        TalentDetailFragment fragment = new TalentDetailFragment();
        fragment.jobSeeker = jobSeeker;
        fragment.job = job;
        fragment.action = new TalentDetailFragment.Action() {
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
