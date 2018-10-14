package com.myjobpitch.fragments;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.TimePicker;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewForCreation;
import com.myjobpitch.api.data.InterviewForUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
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

    @BindView(R.id.interview_date_time_button)
    Button interviewDateTimeButton;

    @BindView(R.id.interview_message)
    MaterialEditText interviewMessage;

    @BindView(R.id.interview_notes)
    MaterialEditText interviewNotes;

    @BindView(R.id.interview_feedback)
    MaterialEditText interviewFeedback;

    @BindView(R.id.interview_create)
    Button createButton;



    public Interview interview;
    public Boolean isEditMode = true;
    public Application application;
    public String mode = "NEW";

    Calendar dateAndTime;

    int year;
    int month;
    int day;
    int hour;
    int minute;

    String tempStr;


    Date date;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_interview_edit, container, false);
        ButterKnife.bind(this, view);

        AppHelper.setJobTitleViewText(jobTitleView, String.format("%s, (%s)", application.getJob_data().getTitle(), AppHelper.getBusinessName(application.getJob_data())));

        loadDetail();

        return  view;
    }

    private void loadDetail() {
        JobSeeker jobSeeker = application.getJob_seeker();
        Job job = application.getJob_data();

        AppHelper.loadJobSeekerImage(jobSeeker, imageView);

        // job seeker name
        itemTitle.setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());

        // CV
        if (AppData.user.isRecruiter()) {
            itemSubTitle.setText(jobSeeker.getDescription());
        } else {
            itemSubTitle.setText(job.getDescription());
        }

        date = new Date();

        if (interview != null) {
            // Date/Time
            SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
            SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
            interviewDateTime.setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));

            date = interview.getAt();

            List<Message> messageList = interview.getMessages();

            //Message
            interviewMessage.setText(messageList.size() == 0 ? "" : messageList.get(messageList.size()-1).getContent());


            //Notes
            interviewNotes.setText(interview.getNotes());

            interviewFeedback.setText(interview.getFeedback());

        }

        interviewFeedback.setVisibility(View.GONE);

        switch (mode) {
            case "NEW":
                title = "Arrange Interview";
                createButton.setText("Send Invitation");
                break;
            case "EDIT":
                title = "Edit Interview";
                createButton.setText("Update");
                break;
            case "NOTE":
                title = "Edit Notes";
                interviewDateTimeButton.setEnabled(false);
                interviewMessage.setEnabled(false);
                createButton.setText("Update Recruiter's Notes");
                break;
            case "COMPLETE":
                title = "Complete Interview";
                interviewDateTimeButton.setVisibility(View.GONE);
                interviewDateTime.setVisibility(View.GONE);
                interviewFeedback.setVisibility(View.VISIBLE);
                createButton.setText("Complete");
                break;
            case "CANCEL":
                title = "Cancel Interview";
                createButton.setText("Cancel");
                interviewDateTimeButton.setEnabled(false);
                interviewFeedback.setVisibility(View.VISIBLE);
                break;
            default:
                break;
        }
    }

    @OnClick(R.id.interview_date_time_button)
    void getDate() {
        dateAndTime = Calendar.getInstance();

        dateAndTime.setTimeInMillis(date.getTime());

        year = dateAndTime.get(Calendar.YEAR);
        month = dateAndTime.get(Calendar.MONTH);
        day = dateAndTime.get(Calendar.DAY_OF_MONTH);

        final DatePickerDialog datePickerDialog;


        datePickerDialog = new DatePickerDialog(getActivity(), AlertDialog.THEME_DEVICE_DEFAULT_LIGHT, new DatePickerDialog.OnDateSetListener() {
            @Override
            public void onDateSet(DatePicker datePicker, int selectedYear, int selectedMonth, int selectedDayOfMonth) {
                tempStr = selectedDayOfMonth + "/" + selectedMonth + "/" + selectedYear;
                getTime();

            }
        }, year, month, day);

        datePickerDialog.setTitle("Select Date");
        datePickerDialog.show();
    }

    void getTime() {
        TimePickerDialog timePickerDialog;

        hour = dateAndTime.get(Calendar.HOUR_OF_DAY);
        minute = dateAndTime.get(Calendar.MINUTE);

        timePickerDialog = new TimePickerDialog(getContext(), AlertDialog.THEME_DEVICE_DEFAULT_LIGHT, new TimePickerDialog.OnTimeSetListener() {
            @Override
            public void onTimeSet(TimePicker timePicker, int selectedHour, int selectedMinute) {
                date = new Date();
                tempStr += " " + selectedHour + ":" + selectedMinute;

                SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy hh:mm");
                try {
                    date = dateFormat.parse(tempStr);
                } catch (ParseException e) {
                    e.printStackTrace();
                }

                SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
                SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
                interviewDateTime.setText(format.format(date) + " at " + format1.format(date));
            }
        }, hour, minute, true);//Yes 24 hour time

        timePickerDialog.setTitle("Select Time");
        timePickerDialog.show();
    }

    void createInterview() {
        final InterviewForCreation interviewForCreation = new InterviewForCreation();
        android.text.format.DateFormat df = new android.text.format.DateFormat();
        String dateStr = String.format("%s", df.format("yyyy-MM-dd hh:mm:ss", date));
        interviewForCreation.setAt(dateStr);
        interviewForCreation.setApplication(application.getId());
        interviewForCreation.setInvitation(interviewMessage.getText().toString() == null ? "" : interviewMessage.getText().toString());
        interviewForCreation.setNotes(interviewNotes.getText().toString() == null ? "" : interviewNotes.getText().toString());
        interviewForCreation.setFeedback("");

        new APITask(new APIAction() {
            @Override
            public void run() {
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

    void updateInterview() {
        final InterviewForUpdate interviewForUpdate = new InterviewForUpdate();
        android.text.format.DateFormat df = new android.text.format.DateFormat();
        String dateStr = String.format("%s", df.format("yyyy-MM-dd hh:mm:ss", date));
        interviewForUpdate.setAt(dateStr);
        interviewForUpdate.setApplication(application.getId());
        interviewForUpdate.setInvitation(interviewMessage.getText().toString() == null ? "" : interviewMessage.getText().toString());
        interviewForUpdate.setNotes(interviewNotes.getText().toString() == null ? "" : interviewNotes.getText().toString());
        interviewForUpdate.setFeedback(interviewFeedback.getText().toString() == null ? "" : interviewFeedback.getText().toString());

        new APITask(new APIAction() {
            @Override
            public void run() {
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
    }

    void completeInterview() {
        final InterviewForUpdate interviewForUpdate = new InterviewForUpdate();
        android.text.format.DateFormat df = new android.text.format.DateFormat();
        String dateStr = String.format("%s", df.format("yyyy-MM-dd hh:mm:ss", date));
        interviewForUpdate.setAt(dateStr);
        interviewForUpdate.setApplication(application.getId());
        interviewForUpdate.setInvitation(interviewMessage.getText().toString() == null ? "" : interviewMessage.getText().toString());
        interviewForUpdate.setNotes(interviewNotes.getText().toString() == null ? "" : interviewNotes.getText().toString());
        interviewForUpdate.setFeedback(interviewFeedback.getText().toString() == null ? "" : interviewFeedback.getText().toString());
        Popup popup = new Popup(getContext(), "Are you sure you want to complete this interview?", true);
        popup.addGreenButton("Yes", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask(new APIAction() {
                    @Override
                    public void run() {
                        MJPApi.shared().completeInterview(interviewForUpdate, interview.getId());
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

    @OnClick(R.id.interview_create)
    void onCreateInterview() {

        switch (mode) {
            case "NEW":
                createInterview();
                break;
            case "EDIT":
            case "NOTE":
                updateInterview();
                break;
            case "COMPLETE":
                completeInterview();
                break;
            default:
                break;
        }

    }

}
