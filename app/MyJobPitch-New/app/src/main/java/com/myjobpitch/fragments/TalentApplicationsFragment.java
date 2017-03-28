package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.utils.ImageLoader;

import java.util.List;

public class TalentApplicationsFragment extends ApplicationsFragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, "You have no applications.", R.layout.cell_application_list);
        return  view;
    }

    @Override
    protected List<Application> getApplications() throws MJPApiException {
        return MJPApi.shared().get(Application.class);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {
        Job job = application.getJob_data();
        ImageLoader.loadJobLogo(job, view);
        setItemTitle(view, job.getTitle());
        setItemSubTitle(view, job.getFullBusinessName());
        setItemAttributes(view, job.getLocation_data().getPlace_name());
        setItemDesc(view, job.getDescription());

        view.findViewById(R.id.remove_button).setVisibility(View.GONE);
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
