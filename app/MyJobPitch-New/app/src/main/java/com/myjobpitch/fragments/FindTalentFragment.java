package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

public class FindTalentFragment extends SwipeFragment<JobSeeker> {

    public Job job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, "There are no more new matches for this job. You can restore your removed matches by clicking refresh above.");
        title = "Find Talent";
        showCredits();

        if (job != null) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        }

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
        final List<JobSeeker> data = new ArrayList<>();

        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                job = MJPApi.shared().getUserJob(job.getId());
                data.addAll(MJPApi.shared().get(JobSeeker.class, "job=" + job.getId()));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                showCredits();
                setData(data);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @Override
    protected void showDeckInfo(JobSeeker jobSeeker, View view) {
        AppHelper.loadJobSeekerImage(jobSeeker, getCardImageContainer(view));
        setCardTitle(view, AppHelper.getJobSeekerName(jobSeeker));
        setCardDesc(view, jobSeeker.getDescription());
    }

    @Override
    protected void swipedRight(final JobSeeker jobSeeker) {
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                applicationForCreation.setJob(job.getId());
                applicationForCreation.setJob_seeker(jobSeeker.getId());
                applicationForCreation.setShortlisted(false);
                applicationForCreation = MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                Application application = MJPApi.shared().get(Application.class, applicationForCreation.getId());
                job = application.getJob_data();
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                int creditCount = job.getLocation_data().getBusiness_data().getTokens();
                creditsView.setText(creditCount + (creditCount > 1 ? " credits" : " credit"));
            }
            @Override
            public void onError(JsonNode errors) {
                if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                    cardStack.unSwipeCard();
                    Popup popup = new Popup(getContext(), "You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", true);
                    popup.addGreyButton("Ok", null);
                    popup.show();
                }
            }
        }).execute();

    }

    @Override
    protected void selectedCard(JobSeeker jobSeeker) {
        TalentDetailFragment fragment = new TalentDetailFragment();
        fragment.jobSeeker = jobSeeker;
        fragment.job = job;
        fragment.action = new TalentDetailFragment.Action() {
            @Override
            public void apply(Job job) {
                FindTalentFragment.this.job = job;
                FindTalentFragment.this.showCredits();
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
    protected  void goToJobDetail() {
        JobDetailFragment fragment = new JobDetailFragment();
        fragment.job = job;
        getApp().pushFragment(fragment);
    }

}
