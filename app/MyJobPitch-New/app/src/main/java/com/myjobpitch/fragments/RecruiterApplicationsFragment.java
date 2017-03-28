package com.myjobpitch.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.DeleteApplication;
import com.myjobpitch.tasks.TaskListener;
import com.myjobpitch.tasks.UpdateApplication;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.ImageLoader;
import com.myjobpitch.utils.Popup;

import java.util.List;

public class RecruiterApplicationsFragment extends ApplicationsFragment {

    public static final int APPLICATIONS = 0;
    public static final int CONNECTIONS = 1;
    public static final int MY_SHORTLIST = 2;

    static final String[] titles = {
            "Applications", "Connections", "My Shortlist"
    };

    static final String[] emptyTexts = {
            "No candidates have applied for this job yet. Once that happens, their applications will appear here.",
            "You have not chosen anyone to connect with for this job. Once that happens, you will be able to sort through them from here. You can switch to search mode to look for potential applicants.",
            "You have not shortlisted any applications for this job, turn off shortlist view to see the non-shortlisted applications."
    };

    public Job job;
    public int listKind;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        int applyButtonIcon = listKind == APPLICATIONS ? R.drawable.swipe_icon_connect : R.drawable.swipe_icon_message;
        View view = initView(inflater, container, applyButtonIcon, emptyTexts[listKind], R.layout.cell_application_list);
        title = titles[listKind];
        return  view;
    }

    @Override
    protected List<Application> getApplications() throws MJPApiException {
        String statusName = listKind == APPLICATIONS ? ApplicationStatus.CREATED: ApplicationStatus.ESTABLISHED;
        Integer status = AppData.get(ApplicationStatus.class, statusName).getId();
        String query = "job=" + job.getId() + "&status=" + status;
        if (listKind == MY_SHORTLIST) {
            query += "&shortlisted=1";
        }
        return MJPApi.shared().get(Application.class, query);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {
        JobSeeker jobSeeker = application.getJobSeeker();
        ImageLoader.loadJobSeekerImage(jobSeeker, view);
        setItemTitle(view, jobSeeker.getFullName());
        setItemSubTitle(view, job.getTitle());
        setItemAttributes(view, job.getFullBusinessName());
        setItemDesc(view, job.getLocation_data().getPlace_name());
        view.findViewById(R.id.item_star).setVisibility(listKind == CONNECTIONS && application.getShortlisted() ? View.VISIBLE : View.GONE);
    }

    @Override
    protected void selectedApplication(Application application) {
        TalentDetailFragment fragment = new TalentDetailFragment();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

    @Override
    protected void applyItem(final Application application) {
        if (listKind == APPLICATIONS) {
            Popup.showYellow("Are you sure you want to connect this applicaton?", "Connect", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Integer established = AppData.get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
                    new UpdateApplication(application, established, new TaskListener() {
                        @Override
                        public void done(Object result) {
                            onRefresh();
                        }
                        @Override
                        public void error(String error) {
                            if (error.equals("NO_TOKENS")) {
                                Popup.showMessage("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                            }
                        }
                    });
                }
            }, "Cancel", null, true);
        } else {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        }
    }

    @Override
    protected void removeItem(final Application application) {
        Popup.showYellow("Are you sure you want to delete this applicaton?", "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new DeleteApplication(application.getId(), new TaskListener() {
                    @Override
                    public void done(Object result) {
                        onRefresh();
                    }
                    @Override
                    public void error(String error) {
                    }
                });
            }
        }, "Cancel", null, true);
    }

}
