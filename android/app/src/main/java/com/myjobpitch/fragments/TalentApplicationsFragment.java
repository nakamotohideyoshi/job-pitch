package com.myjobpitch.fragments;

import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import java.util.ArrayList;
import java.util.List;

public class TalentApplicationsFragment extends ApplicationsFragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, getString(R.string.applications_empty_text), R.layout.cell_application_list);

        return  view;
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 109) {
            getApp().setRootFragement(R.id.menu_messages);
        } else {
            super.onMenuSelected(menuID);
        }
    }
    @Override
    protected List<Application> getApplications() {
        JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
        if (jobSeeker.getPitch() == null) {
            return new ArrayList<>();
        }

        return MJPApi.shared().get(Application.class);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {
        Job job = application.getJob_data();
        AppHelper.loadJobLogo(job, view);
        setItemTitle(view, job.getTitle());
        setItemSubTitle(view, AppHelper.getBusinessName(job));
        setItemAttributes(view, job.getLocation_data().getPlace_name());
        setItemDesc(view, job.getDescription());

        AppHelper.getRemoveButton(view).setVisibility(View.GONE);
    }

    @Override
    protected void selectedApplication(Application application) {
        ApplicationDetailFragment fragment = new ApplicationDetailFragment();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

    @Override
    protected void applyItem(final Application application) {
        MessageFragment fragment = new MessageFragment();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

}
