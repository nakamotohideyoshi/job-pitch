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
import com.myjobpitch.api.data.Jobseeker;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import java.util.ArrayList;
import java.util.List;

public class TalentApplicationsFragment extends ApplicationsFragment {

    View noPitchView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, "You have no applications.", R.layout.cell_application_list);

        noPitchView = view.findViewById(R.id.nopitch_view);
        view.findViewById(R.id.go_record_now).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getApp().setRootFragement(R.id.menu_record);
            }
        });

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
        Jobseeker jobseeker = MJPApi.shared().get(Jobseeker.class, AppData.user.getJob_seeker());
        if (jobseeker.getPitch() == null) {
            Handler mainHandler = new Handler(TalentApplicationsFragment.this.getContext().getMainLooper());

            Runnable myRunnable = new Runnable() {
                @Override
                public void run() {
                    noPitchView.setVisibility(View.VISIBLE);
                }
            };
            mainHandler.post(myRunnable);
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
        ApplicationDetailsFragment fragment = new ApplicationDetailsFragment();
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
