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
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import org.apache.commons.lang3.SerializationUtils;

import java.util.List;

public class RecruiterApplicationsFragment extends ApplicationsFragment {

    public static final int APPLICATIONS = 0;
    public static final int CONNECTIONS = 1;
    public static final int MY_SHORTLIST = 2;

    private static final String[] titles = {
            "Applications", "Connections", "My Shortlist"
    };

    private static final String[] emptyTexts = {
            "No applications at the moment. Once thet happens you cant go trough them here and shortlist\nif needed, you can easy switch to Find Talent mode and \"head hunt\" as well.",
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
        AppHelper.loadJobSeekerImage(jobSeeker, view);
        setItemTitle(view, AppHelper.getJobSeekerName(jobSeeker));
        setItemSubTitle(view, job.getTitle());
        setItemAttributes(view, AppHelper.getBusinessName(job));
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
                    Application updatedApplication = SerializationUtils.clone(application);
                    updatedApplication.setStatus(established);
                    final ApplicationStatusUpdate update = new ApplicationStatusUpdate(application);

                    new APITask("Connecting...", new APITask.ErrorListener() {
                        @Override
                        public void onError(MJPApiException e) {
                            JsonNode errors = e.getErrors();
                            if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                Popup.showError("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                            } else {
                                onError(e);
                            }
                        }
                    }) {
                        @Override
                        protected void runAPI() throws MJPApiException {
                            MJPApi.shared().updateApplicationStatus(update);
                        }
                        @Override
                        protected void onSuccess() {
                            onRefresh();
                        }
                    };

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
                new APITask("Deleting...", RecruiterApplicationsFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().delete(Application.class, application.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        onRefresh();
                    }
                };
            }
        }, "Cancel", null, true);
    }

}
