package com.myjobpitch.fragments;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.CreateApplication;
import com.myjobpitch.tasks.TaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageLoader;
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
        AppHelper.showLoading("Loading...");
        new AsyncTask<Void, Void, List<Job>>() {
            @Override
            protected List<Job> doInBackground(Void... params) {
                try {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
                    return MJPApi.shared().get(Job.class);
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Job> data) {
                AppHelper.hideLoading();
                setData(data);
            }
        }.execute();
    }

    @Override
    protected void showDeckInfo(Job job, View view) {
        ImageLoader.loadJobLogo(job, getCardImageContainer(view));
        setCardTitle(view, job.getTitle());
        setCardDesc(view, job.getDescription());
    }

    @Override
    protected void swipedRight(Job job) {
        if (jobSeeker.getPitch() == null) {
            Popup.showGreen("You need to record your pitch video to apply.", "Record my pitch", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
                }
            }, "Cancel", null, true);
            cardStack.unSwipeCard();
        } else {
            new CreateApplication(job.getId(), jobSeeker.getId(), new TaskListener<Application>() {
                @Override
                public void done(Application application) {
                }
                @Override
                public void error(String error) {
                    cardStack.unSwipeCard();
                }
            });
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
