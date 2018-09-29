package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.support.v4.view.GravityCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
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
import com.myjobpitch.api.data.InterviewStatus;
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
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class InterviewDetailFragment extends BaseFragment {

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @BindView(R.id.image_view)
    ImageView imageView;

    @BindView(R.id.item_title)
    TextView itemTitle;

    @BindView(R.id.item_subtitle)
    TextView itemSubTitle;

    @BindView(R.id.item_status)
    TextView itemStatus;

    @BindView(R.id.item_date_time)
    TextView itemDateTime;

    @BindView(R.id.item_location)
    TextView itemLocation;

    @BindView(R.id.item_feedback)
    TextView itemFeedback;

    @BindView(R.id.feedback_container)
    RelativeLayout feedbackContainer;

    @BindView(R.id.item_notes)
    TextView itemNotes;

    @BindView(R.id.notes_container)
    RelativeLayout notesContainer;

    @BindView(R.id.buttons_container)
    LinearLayout buttonsContainer;

    @BindView(R.id.notes_edit)
    RelativeLayout editNotes;

    @BindView(R.id.interview_message)
    RelativeLayout messageButton;

    @BindView(R.id.interview_complete)
    Button completeButton;

    @BindView(R.id.interview_accept)
    Button acceptButton;

    @BindView(R.id.interview_cancel)
    Button cancelButton;

    @BindView(R.id.header_button_container)
    LinearLayout headerButtonContainer;

    @BindView(R.id.interview_history_list)
    LinearLayout interviewHistoryList;

    Interview interview;
    public Application application;
    public Integer interviewId;
    public Boolean historyMode = false;
    private LinearLayout historyList;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_interview_detail, container, false);
        ButterKnife.bind(this, view);


        title = "Interview";

        AppHelper.setJobTitleViewText(jobTitleView, String.format("%s, (%s)", application.getJob_data().getTitle(), AppHelper.getBusinessName(application.getJob_data())));

        if (historyMode) {
            loadDetail();
        } else {
            showLoading(view);
            loadInterview();
        }

        historyList = view.findViewById(R.id.interview_history_list);

        return  view;
    }

    private void loadInterview() {
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                interview = MJPApi.shared().getInterview(interviewId);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                loadDetail();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    private void loadDetail() {
        JobSeeker jobSeeker = application.getJobSeeker();
        Job job = application.getJob_data();
        String status = interview.getStatus();

        if (AppData.user.isRecruiter()) {
            AppHelper.loadJobSeekerImage(jobSeeker, imageView);
            // job seeker name
            itemTitle.setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());
            // CV
            itemSubTitle.setText(jobSeeker.getDescription());
        } else {
            AppHelper.loadJobLogo(job, imageView);
            // job title
            itemTitle.setText(job.getTitle());
            // job Description
            itemSubTitle.setText(job.getDescription());
        }

        // Status
        itemStatus.setText(String.format("%s", interview.getStatus()));

        // Date/Time
        SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
        SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
        itemDateTime.setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));

        // Location
        itemLocation.setText(application.getJob_data().getLocation_data().getPlace_name());

        // Feedback
        itemFeedback.setText(interview.getFeedback());
        feedbackContainer.setVisibility(View.GONE);

        // Note
        itemNotes.setText(interview.getNotes());
        notesContainer.setVisibility(View.VISIBLE);

        completeButton.setVisibility(AppData.user.isJobSeeker() ? View.GONE : View.VISIBLE);
        acceptButton.setVisibility(AppData.user.isRecruiter() ? View.GONE : View.VISIBLE);
        editNotes.setVisibility(AppData.user.isRecruiter() ? View.VISIBLE : View.GONE);
        notesContainer.setVisibility(AppData.user.isRecruiter() ? View.VISIBLE :View.GONE);

        switch (status) {
            case InterviewStatus.PENDING:
                // Status
                itemStatus.setText(AppData.user.isRecruiter() ? "Interview request sent" : "Interview request received");
                if (AppData.user.isRecruiter()) {
                    addMenuItem(MENUGROUP1, 120, "Edit Interview", R.drawable.ic_edit);
                    editNotes.setVisibility(View.GONE);
                }
                break;
            case InterviewStatus.ACCEPTED:
                // Status
                itemStatus.setText("Interview accepted");
                acceptButton.setVisibility(View.GONE);
                if (AppData.user.isRecruiter()) {
                    addMenuItem(MENUGROUP1, 120, "Edit Interview", R.drawable.ic_edit);
                }
                break;
            case InterviewStatus.COMPLETED:
                // Status
                itemStatus.setText("This interview is done");
                headerButtonContainer.setVisibility(View.GONE);

                if (AppData.user.isRecruiter()) {
                    addMenuItem(MENUGROUP1, 121, "Arrange Interview", R.drawable.menu_interview);
                }

                feedbackContainer.setVisibility(View.VISIBLE);

                break;

            case InterviewStatus.CANCELLED:
                // Status

                itemStatus.setText("Interview cancelled by " + (interview.getCancelled_by() == AppData.JOBSEEKER ? "Job seeker"  : "Recruiter"));

                headerButtonContainer.setVisibility(View.GONE);

                if (AppData.user.isRecruiter()) {
                    addMenuItem(MENUGROUP1, 121, "Arrange Interview", R.drawable.menu_interview);
                }

                break;
            default:
                break;

        }

        if (historyMode) {
            buttonsContainer.setVisibility(View.GONE);
            headerButtonContainer.setVisibility(View.GONE);
            interviewHistoryList.setVisibility(View.GONE);
        } else {

            List<Interview> interviews = application.getInterviews();

            Collections.sort(interviews, new Comparator<Interview>() {
                public int compare(Interview o1, Interview o2) {
                    return o2.getAt().compareTo(o1.getAt());
                }
            });
            for (final Interview applicationInterview : interviews) {

                if (applicationInterview.getId().intValue() != interviewId.intValue()) {
                    View view = getLayoutInflater().inflate(R.layout.cell_interview_history, null);
                    view.setOnClickListener(new View.OnClickListener() {
                        public void onClick(View v) {
                            InterviewDetailFragment fragment = new InterviewDetailFragment();
                            fragment.interview = applicationInterview;
                            fragment.application = application;
                            fragment.historyMode = true;
                            getApp().pushFragment(fragment);
                        }
                    });
                    historyList.addView(view);
                    AppHelper.showApplicationInterviewInfo(applicationInterview, view);
                }
            }
        }
    }

    @OnClick(R.id.header_container)
    void showProfile() {
        if (AppData.user.isJobSeeker()) {
            ApplicationDetailFragment fragment = new ApplicationDetailFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        } else {
            TalentDetailFragment fragment = new TalentDetailFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        }
    }

    @OnClick(R.id.notes_edit)
    void editNotes() {
        InterviewEditFragment fragment = new InterviewEditFragment();
        fragment.application = application;
        fragment.mode = "NOTE";
        fragment.interview = interview;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.interview_message)
    void onMessage() {
        MessageFragment fragment = new MessageFragment();
        fragment.application = application;
        fragment.interview = interview;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.interview_cancel)
    void onCancel() {
        Popup popup = new Popup(getContext(), "Are you sure you want to cancel this interview?", true);
        popup.addGreenButton("Yes", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask(new APIAction() {
                    @Override
                    public void run() throws MJPApiException {
                        MJPApi.shared().deleteInterview(interview.getId());
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
        });
        popup.addGreyButton("No", null);
        popup.show();
    }

    @OnClick(R.id.interview_accept)
    void onAccept() {
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().acceptInterview(interviewId);
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

    @OnClick(R.id.interview_complete)
    void onComplete() {
        InterviewEditFragment fragment = new InterviewEditFragment();
        fragment.application = application;
        fragment.mode = "COMPLETE";
        fragment.interview = interview;
        getApp().pushFragment(fragment);
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 120) {
            InterviewEditFragment fragment = new InterviewEditFragment();
            fragment.application = application;
            fragment.mode = "EDIT";
            fragment.interview = interview;
            getApp().pushFragment(fragment);
        } else if (menuID == 121) {
            InterviewEditFragment fragment = new InterviewEditFragment();
            fragment.application = application;
            fragment.mode = "NEW";
            getApp().pushFragment(fragment);
        }
    }
}
