package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ExcludeJobseeker;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Jobseeker;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.OnClick;

public class FindTalentFragment extends SwipeFragment<Jobseeker> {

    public Job job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, "There are no more new matches for this job.");
        title = "Find Talent";

        emptyButton.setText("Remove filter");
        emptyButton.setVisibility(View.VISIBLE);

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
        final List<Jobseeker> data = new ArrayList<>();

        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() {
                job = MJPApi.shared().getUserJob(job.getId());
                data.addAll(MJPApi.shared().get(Jobseeker.class, "job=" + job.getId()));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                showCredits();
                updateEmptyView();
                setData(data);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @Override
    protected void showDeckInfo(Jobseeker jobseeker, View view) {
        AppHelper.loadJobseekerImage(jobseeker, getCardImageContainer(view));
        setCardTitle(view, AppHelper.getJobseekerName(jobseeker));
        setCardDesc(view, jobseeker.getDescription());
    }

    private void updateEmptyView() {
        String str = "There are no more new matches for this job.";
        if (job.getRequires_cv()) {
            str = String.format("%s\n\n%s", str, "You are currently hiding job seekers who have not uploaded a CV");
        }
        if (job.getRequires_pitch()) {
            str = String.format("%s\n%s", str, "You are currently hiding job seekers who have not uploaded a video pitch");
        }
        AppHelper.setEmptyViewText(emptyView, str);
    }

    @OnClick(R.id.empty_button)
    void onJobEdit() {
        JobEditFragment fragment = new JobEditFragment();
        fragment.job = job;
        getApp().pushFragment(fragment);
    }

    @Override
    protected void swipedLeft(final Jobseeker jobseeker) {
        new APITask(new APIAction() {
            @Override
            public void run() {
                ExcludeJobseeker data = new ExcludeJobseeker();
                data.setJob(job.getId());
                data.setJob_seeker(jobseeker.getId());
                MJPApi.shared().excludeJobseeker(data);
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

    @Override
    protected void swipedRight(final Jobseeker jobseeker) {
        new APITask(new APIAction() {
            @Override
            public void run() {
                ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                applicationForCreation.setJob(job.getId());
                applicationForCreation.setJob_seeker(jobseeker.getId());
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
                    new Popup(getContext())
                            .setMessage("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.")
                            .addGreyButton("Ok", null)
                            .show();
                }
            }
        }).execute();

    }

    @Override
    protected void selectedCard(Jobseeker jobseeker) {
        TalentDetailsFragment fragment = new TalentDetailsFragment();
        fragment.jobseeker = jobseeker;
        fragment.job = job;
        fragment.action = new TalentDetailsFragment.Action() {
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
    protected  void goToJobDetails() {
        JobDetailsFragment fragment = new JobDetailsFragment();
        fragment.job = job;
        getApp().pushFragment(fragment);
    }

}
