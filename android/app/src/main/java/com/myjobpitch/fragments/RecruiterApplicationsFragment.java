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

    private static final int[] titles = {
            R.string.applications_title, R.string.connections_title, R.string.my_shortlist
    };

    private static final int[] emptyTexts = {
            R.string.new_applications_empty_text, R.string.connections_empty_text,  R.string.my_shortlist_empty_text
    };

    public Job job;
    public int listKind;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        int applyButtonIcon = listKind == APPLICATIONS ? R.drawable.swipe_icon_connect : R.drawable.swipe_icon_message;
        View view = initView(inflater, container, applyButtonIcon, getString(emptyTexts[listKind]), R.layout.cell_application_list);
        title = getString(titles[listKind]);

        if (job != null) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        }

        addMenuItem(MENUGROUP1, 101, getString(R.string.job_details), R.drawable.ic_edit);
        addMenuItem(MENUGROUP1, 121, getString(R.string.add_application), R.drawable.ic_add);
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
                setItemSubTitle(view, String.format("%s (%s)", job.getTitle(), getString(R.string.pending_interview)));
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
            Popup popup = new Popup(getContext(), R.string.connect_message, true);
            popup.addYellowButton(R.string.connect_1, view -> {
                showLoading();
                new APITask(() -> {
                    Application updatedApplication = SerializationUtils.clone(application);
                    updatedApplication.setStatus(ApplicationStatus.ESTABLISHED_ID);
                    final ApplicationStatusUpdate update = new ApplicationStatusUpdate(application);
                    MJPApi.shared().updateApplicationStatus(update);
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
                            Popup popup1 = new Popup(getContext(), R.string.no_tokens, true);
                            popup1.addGreyButton(R.string.ok, null);
                            popup1.show();
                        } else {
                            errorHandler(errors);
                        }

                    }
                }).execute();

            });
            popup.addGreyButton(R.string.cancel, null);
            popup.show();
        } else {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        }
    }

    @Override
    protected void removeItem(final Application application) {
        Popup popup = new Popup(getContext(), R.string.appliction_remove_message, true);
        popup.addYellowButton(R.string.delete, view -> {
            showLoading();
            new APITask(() -> MJPApi.shared().delete(Application.class, application.getId())).addListener(new APITaskListener() {
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


        });
        popup.addGreyButton(R.string.cancel, null);
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
