package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.utils.AppData;

import butterknife.ButterKnife;
import butterknife.OnClick;

public class HelpFragment extends BaseFragment {

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_help, container, false);
        ButterKnife.bind(this, view);
        return  view;
    }

    @OnClick(R.id.help_about)
    void onAbout() {
        goWebviewFragment(R.string.about, "about");
    }

    @OnClick(R.id.help_how_it)
    void onHowIt() {
        if (AppData.userRole == Role.JOB_SEEKER_ID) {
            goWebviewFragment(R.string.how_it, "help_jobseeker");
        } else {
            goWebviewFragment(R.string.how_it, "help_recruiter");
        }
    }

    @OnClick(R.id.help_terms)
    void onTerms() {
        goWebviewFragment(R.string.terms, "terms");
    }

    @OnClick(R.id.help_privacy)
    void onPrivacy() {
        goWebviewFragment(R.string.privacy, "privacy");
    }

    void goWebviewFragment(int titleId, String filename) {
        WebviewFragment fragment = new WebviewFragment();
        fragment.title = getString(titleId);
        fragment.mFilename = filename;
        getApp().pushFragment(fragment);
    }

}

