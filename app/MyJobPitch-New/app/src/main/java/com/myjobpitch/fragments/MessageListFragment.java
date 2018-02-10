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
import com.myjobpitch.api.data.Message;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

public class MessageListFragment extends ApplicationsFragment {

    View noPitchView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, "You have no applications.", R.layout.cell_message_list);

        noPitchView = view.findViewById(R.id.nopitch_view);
        view.findViewById(R.id.go_record_now).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
            }
        });

        return view;
    }

    @Override
    protected List<Application> getApplications() throws MJPApiException {
        JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
        if (jobSeeker.getPitch() == null) {
            Handler mainHandler = new Handler(MessageListFragment.this.getContext().getMainLooper());

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
        Message lastMessage = application.getMessages().get(application.getMessages().size()-1);
        Job job = application.getJob_data();

        if (AppData.user.isJobSeeker()) {
            AppHelper.loadJobLogo(job, AppHelper.getImageView(view));
            setItemTitle(view, job.getTitle());
            setItemSubTitle(view, AppHelper.getBusinessName(job));
        } else {
            JobSeeker jobSeeker = application.getJobSeeker();
            AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(view));
            setItemTitle(view, AppHelper.getJobSeekerName(jobSeeker));
            setItemSubTitle(view, String.format("%s (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        }

        SimpleDateFormat format = new SimpleDateFormat("MMM d, h:mm a");
        setItemAttributes(view, format.format(lastMessage.getCreated()));

        if (lastMessage.getFrom_role() == AppData.getUserRole().getId()) {
            setItemDesc(view, "You: " + lastMessage.getContent());
        } else {
            setItemDesc(view, lastMessage.getContent());
        }

        AppHelper.getEditButton(view).setVisibility(View.GONE);
        AppHelper.getRemoveButton(view).setVisibility(View.GONE);


    }

    @Override
    protected void selectedApplication(Application application) {
        MessageFragment fragment = new MessageFragment();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

}
