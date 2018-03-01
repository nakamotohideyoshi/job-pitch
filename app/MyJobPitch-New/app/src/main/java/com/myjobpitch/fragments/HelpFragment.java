package com.myjobpitch.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
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
        goWebviewFragment("About", "about");
    }

    @OnClick(R.id.help_how_it)
    void onHowIt() {
        if (AppData.user.isJobSeeker() || (!AppData.user.isRecruiter() && AppData.getUserType() == AppData.JOBSEEKER)) {
            goWebviewFragment("How it works", "help_jobseeker");
        } else {
            goWebviewFragment("How it works", "help_recruiter");
        }
    }

    @OnClick(R.id.help_terms)
    void onTerms() {
        goWebviewFragment("Terms and Conditions", "terms");
    }

    @OnClick(R.id.help_privacy)
    void onPrivacy() {
        goWebviewFragment("Privacy", "privacy");
    }

    @OnClick(R.id.help_shareapp)
    void onShareApp() {
        String link = AppData.user.isRecruiter() ? "https://www.myjobpitch.com/recruiters/" : "https://www.myjobpitch.com/candidates/";
        Intent sharingIntent = new Intent(Intent.ACTION_SEND);
        sharingIntent.setType("text/html");
        sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
        startActivity(Intent.createChooser(sharingIntent,"Share using"));
    }

    @OnClick(R.id.help_twitter)
    void onFollow() {
        Intent intent;
        try {
            getActivity().getPackageManager().getPackageInfo("com.twitter.android", 0);
            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("twitter://user?screen_name=myjobpitch"));
        } catch (Exception e) {
            intent = new Intent(Intent.ACTION_VIEW, Uri.parse("https://twitter.com/myjobpitch"));
        }
        startActivity(intent);
    }

    void goWebviewFragment(String title, String filename) {
        WebviewFragment fragment = new WebviewFragment();
        fragment.title = title;
        fragment.mFilename = filename;
        getApp().pushFragment(fragment);
    }

}

