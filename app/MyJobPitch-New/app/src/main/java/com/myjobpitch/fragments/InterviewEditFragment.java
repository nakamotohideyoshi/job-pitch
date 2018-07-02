package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewForCreation;
import com.myjobpitch.api.data.InterviewForUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobPitch;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.uploader.AWSJobPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class InterviewEditFragment extends FormFragment {

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @BindView(R.id.image_view)
    ImageView imageView;

    @BindView(R.id.item_title)
    TextView itemTitle;

    @BindView(R.id.item_subtitle)
    TextView itemSubTitle;

    @BindView(R.id.interview_date_time)
    MaterialEditText interviewDateTime;

    @BindView(R.id.interview_message)
    MaterialEditText interviewMessage;

    @BindView(R.id.interview_notes)
    MaterialEditText interviewNotes;



    public Interview interview;
    public Boolean isEditMode = true;
    public Application application;

    Date date;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_interview_edit, container, false);
        ButterKnife.bind(this, view);

        title = "Arrange Interview";

        AppHelper.setJobTitleViewText(jobTitleView, String.format("%s, (%s)", application.getJob_data().getTitle(), AppHelper.getBusinessName(application.getJob_data())));

        loadDetail();

        return  view;
    }

    private void loadDetail() {
        JobSeeker jobSeeker = application.getJobSeeker();
        AppHelper.loadJobSeekerImage(jobSeeker, imageView);

        // job seeker name
        itemTitle.setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());

        // CV
        itemSubTitle.setText(jobSeeker.getCV() == null ? "Can't find CV" : jobSeeker.getCV());

        if (isEditMode) {
            // Date/Time
            SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
            SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
            interviewDateTime.setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));

            date = interview.getAt();

            //Message

            //Notes
            interviewNotes.setText(interview.getNotes());
        }
    }

    @OnClick(R.id.interview_date_time_button)
    void getDate() {
        date = new Date();
        SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
        SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
        interviewDateTime.setText(format.format(date) + " at " + format1.format(date));
    }

    @OnClick(R.id.interview_create)
    void onCreateInterview() {
        if (isEditMode) {
            final InterviewForUpdate interviewForUpdate = new InterviewForUpdate();
            interviewForUpdate.setAt(date);
            interviewForUpdate.setApplication(application.getId());
            interviewForUpdate.setInvitation("");
            interviewForUpdate.setNotes(interviewNotes.getText().toString() == null ? "" : interviewNotes.getText().toString());
            interviewForUpdate.setFeedback("");

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    MJPApi.shared().updateInterview(interviewForUpdate, interview.getId());
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    getApp().popFragment();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();

        } else {
            final InterviewForCreation interviewForCreation = new InterviewForCreation();
            interviewForCreation.setAt(date);
            interviewForCreation.setApplication(application.getId());
            interviewForCreation.setInvitation("");
            interviewForCreation.setNotes(interviewNotes.getText().toString() == null ? "" : interviewNotes.getText().toString());
            interviewForCreation.setFeedback("");

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    MJPApi.shared().createInterview(interviewForCreation);
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    getApp().popFragment();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        }
    }




}
