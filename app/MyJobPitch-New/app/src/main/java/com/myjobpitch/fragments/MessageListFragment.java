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
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import java.text.SimpleDateFormat;
import java.util.List;

public class MessageListFragment extends ApplicationsFragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, R.drawable.swipe_icon_message, "You have no applications.", R.layout.cell_message_list);
        return view;
    }

    @Override
    protected List<Application> getApplications() throws MJPApiException {
        return MJPApi.shared().get(Application.class);
    }

    @Override
    protected void showApplicationInfo(Application application, View view) {
        Message lastMessage = application.getMessages().get(application.getMessages().size()-1);
        Job job = application.getJob_data();

        if (AppData.user.isJobSeeker()) {
            AppHelper.loadJobLogo(job, AppHelper.getImageView(view));
            setItemTitle(view, job.getTitle());
            setItemSubTitle(view, job.getFullBusinessName());
        } else {
            JobSeeker jobSeeker = application.getJobSeeker();
            AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(view));
            setItemTitle(view, jobSeeker.getFullName());
            setItemSubTitle(view, String.format("%s (%s)", job.getTitle(), job.getFullBusinessName()));
        }

        SimpleDateFormat format = new SimpleDateFormat("MMM d, h:mm a");
        setItemAttributes(view, format.format(lastMessage.getCreated()));

        if (lastMessage.getFrom_role() == AppData.getUserRole().getId()) {
            setItemDesc(view, "You: " + lastMessage.getContent());
        } else {
            setItemDesc(view, lastMessage.getContent());
        }

        view.findViewById(R.id.edit_button).setVisibility(View.GONE);
        view.findViewById(R.id.remove_button).setVisibility(View.GONE);
    }

    @Override
    protected void selectedApplication(Application application) {
        MessageFragment fragment = new MessageFragment();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

}
