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
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

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

        if (job != null) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        }

        addMenuItem(MENUGROUP1, 101, "Job Details", R.drawable.ic_edit);
        addMenuItem(MENUGROUP1, 121, "Add Application", R.drawable.ic_add);
        return  view;
    }

    @Override
    protected List<Application> getApplications() {
        Integer status = listKind == APPLICATIONS ? ApplicationStatus.CREATED_ID: ApplicationStatus.ESTABLISHED_ID;
        String query = "job=" + job.getId() + "&status=" + status;
        if (listKind == MY_SHORTLIST) {
            query += "&shortlisted=1";
        }
        return MJPApi.shared().get(Application.class, query);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {
        JobSeeker jobSeeker = application.getJob_seeker();
        AppHelper.loadJobSeekerImage(jobSeeker, view);
        setItemTitle(view, AppHelper.getJobSeekerName(jobSeeker));
        setItemSubTitle(view, job.getTitle());
        setItemAttributes(view, AppHelper.getBusinessName(job));
        setItemDesc(view, job.getLocation_data().getPlace_name());
        view.findViewById(R.id.item_star).setVisibility(listKind == CONNECTIONS && application.getShortlisted() ? View.VISIBLE : View.GONE);

        if (listKind == CONNECTIONS || listKind == MY_SHORTLIST) {
            Boolean isOpenInterview = false;
            for (Interview applicationInterview : application.getInterviews()) {
                if (applicationInterview.getStatus().equals(InterviewStatus.PENDING) || applicationInterview.getStatus().equals(InterviewStatus.ACCEPTED)) {
                    isOpenInterview = true;
                    break;
                }
            }
            if (isOpenInterview) {
                setItemSubTitle(view, (job.getTitle() + " (Pending Interview)"));
            }
        }
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
            Popup popup = new Popup(getContext(), "Are you sure you want to connect this applicaton?", true);
            popup.addYellowButton("Connect (1 credit)", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    showLoading();
                    new APITask(new APIAction() {
                        @Override
                        public void run() {
                            Application updatedApplication = SerializationUtils.clone(application);
                            updatedApplication.setStatus(ApplicationStatus.ESTABLISHED_ID);
                            final ApplicationStatusUpdate update = new ApplicationStatusUpdate(application);
                            MJPApi.shared().updateApplicationStatus(update);
                        }
                    }).addListener(new APITaskListener() {
                        @Override
                        public void onSuccess() {
                            hideLoading();
                            onRefresh();
                        }
                        @Override
                        public void onError(JsonNode errors) {
                            if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                hideLoading();
                                Popup popup = new Popup(getContext(), "You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.", true);
                                popup.addGreyButton("Ok", null);
                                popup.show();
                            } else {
                                errorHandler(errors);
                            }

                        }
                    }).execute();

                }
            });
            popup.addGreyButton("Cancel", null);
            popup.show();
        } else {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        }
    }

    @Override
    protected void removeItem(final Application application) {
        Popup popup = new Popup(getContext(), "Are you sure you want to delete this applicaton?", true);
        popup.addYellowButton("Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showLoading();
                new APITask(new APIAction() {
                    @Override
                    public void run() {
                        MJPApi.shared().delete(Application.class, application.getId());
                    }
                }).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {
                        hideLoading();
                        onRefresh();
                    }
                    @Override
                    public void onError(JsonNode errors) {
                        errorHandler(errors);
                    }
                }).execute();


            }
        });
        popup.addGreyButton("Cancel", null);
        popup.show();
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 101) {
            JobDetailFragment fragment = new JobDetailFragment();
            fragment.job = job;
            getApp().pushFragment(fragment);
        } else if (menuID == 121) {
            ExternalApplicantFragment fragment = new ExternalApplicantFragment();
            fragment.job = job;
            getApp().pushFragment(fragment);
        }
    }
}
