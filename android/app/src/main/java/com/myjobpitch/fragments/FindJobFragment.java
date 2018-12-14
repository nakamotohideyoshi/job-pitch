package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

public class FindJobFragment extends SwipeFragment<Job> {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = initView(inflater, container, getString(R.string.find_job_empty_message));
        title = getString(R.string.find_job);
        creditsView.setVisibility(View.GONE);

        return  view;
    }

    @Override
    protected void loadData() {
        final List<Job> data = new ArrayList<>();

        showLoading();
        new APITask(() -> data.addAll(MJPApi.shared().get(Job.class))).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
//                showInactiveBanner();
                setData(data);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

//    void showInactiveBanner() {
//        if (!jobSeeker.isActive()) {
//            AppHelper.setJobTitleViewText(jobTitleView, "Your profile is not active!");
//        } else {
//            AppHelper.setJobTitleViewText(jobTitleView, "");
//        }
//    }

    @Override
    protected void showDeckInfo(Job job, View view) {
        AppHelper.loadJobLogo(job, getCardImageContainer(view));
        setCardTitle(view, job.getTitle());
        setCardDesc(view, job.getDescription());

        Location location = job.getLocation_data();
        String distance = AppHelper.distance(AppData.profile.getLatitude(), AppData.profile.getLongitude(), location.getLatitude(), location.getLongitude());
        ((TextView)view.findViewById(R.id.distance)).setText(distance);

        ((TextView)view.findViewById(R.id.right_mark_text)).setText("Apply");
    }

    void showProfile() {
        cardStack.unSwipeCard();
        TalentProfileFragment fragment = new TalentProfileFragment();
        getApp().pushFragment(fragment);
    }

    @Override
    protected void swipedRight(final Job job) {

        if (!AppData.jobSeeker.isActive()) {
            Popup popup = new Popup(getContext(), R.string.to_apply_account_activate, true);
            popup.addGreenButton(R.string.activate, view -> showProfile());
            popup.addGreyButton(R.string.cancel, v -> cardStack.unSwipeCard());
            popup.show();
            return;
        }

        if (AppData.jobSeeker.getProfile_image() == null) {
            Popup popup = new Popup(getContext(), R.string.to_apply_set_photo, true);
            popup.addGreenButton(R.string.edit_profile, view -> showProfile());
            popup.addGreyButton(R.string.cancel, v -> cardStack.unSwipeCard());
            popup.show();
            return;
        }

        if (job.getRequires_cv() && AppData.jobSeeker.getCV() == null) {
            Popup popup = new Popup(getContext(), R.string.job_requires_cv, true);
            popup.addGreenButton(R.string.edit_profile, view -> showProfile());
            popup.addGreyButton(R.string.cancel, v -> cardStack.unSwipeCard());
            popup.show();
            return;
        }

        cardStack.unSwipeCard();
        JobApplyFragment fragment = new JobApplyFragment();
        fragment.job = job;
        fragment.callback = () -> topCardItemId++;
        getApp().pushFragment(fragment);

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

    @Override
    public void onMenuSelected(int menuID) {

        if (menuID == 108) {
            getApp().setRootFragement(R.id.menu_messages);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    @Override
    protected void goToEditProfile() {
        TalentProfileFragment fragment = new TalentProfileFragment();
        getApp().pushFragment(fragment);
    }

}
