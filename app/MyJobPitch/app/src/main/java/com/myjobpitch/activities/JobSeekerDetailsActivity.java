package com.myjobpitch.activities;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadApplicationTask;
import com.myjobpitch.tasks.ReadJobSeekerTask;

import java.io.IOException;

public class JobSeekerDetailsActivity extends MJPProgressActionBarActivity {

    private static final String TAG = "JobSeekerDetails";

    public static final String JOB_SEEKER_ID = "JOB_SEEKER_ID";
    public static final String JOB_SEEKER_DATA = "JOB_SEEKER_DATA";
    public static final String APPLICATION_DATA = "APPLICATION_DATA";
    public static final String APPLICATION_ID = "APPLICATION_ID";

    private JobSeeker jobSeeker;
    private Application application;

    private View mJobSeekerDetailsView;
    private View mProgressView;
    private TextView mJobSeekerNameView;
    private TextView mJobSeekerDescriptionView;
    private TextView mJobSeekerPropertiesView;
    private ImageView mJobSeekerImageView;
    private ProgressBar mJobSeekerImageProgressView;
    private TextView mJobSeekerNoImageView;
    private View mJobSeekerImageContainer;
    private View mJobSeekerPlayButton;
    private TextView mJobSeekerNoContactView;
    private TextView mJobSeekerTelephoneView;
    private TextView mJobSeekerMobileView;
    private TextView mJobSeekerEmailView;
    private View mJobSeekerCVView;
    private Button mJobSeekerCVButton;
    private Button mJobSeekerSendMessageButton;
    private TextView mJobSeekerReferencesAvailableView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_seeker_details);

        mJobSeekerDetailsView = findViewById(R.id.job_seeker_details);
        mProgressView = findViewById(R.id.progress);
        mJobSeekerNameView = (TextView) findViewById(R.id.job_seeker_name);
        mJobSeekerDescriptionView = (TextView) findViewById(R.id.job_seeker_description);
        mJobSeekerPropertiesView = (TextView) findViewById(R.id.job_seeker_properties);
        mJobSeekerImageContainer = findViewById(R.id.image_container);
        mJobSeekerImageView = (ImageView) findViewById(R.id.image);
        mJobSeekerImageProgressView = (ProgressBar) findViewById(R.id.image_progress);
        mJobSeekerPlayButton = findViewById(R.id.play_button);
        mJobSeekerNoImageView = (TextView) findViewById(R.id.no_image);
        mJobSeekerNoContactView = (TextView) findViewById(R.id.no_contact_details);
        mJobSeekerTelephoneView = (TextView) findViewById(R.id.job_seeker_telephone);
        mJobSeekerMobileView = (TextView) findViewById(R.id.job_seeker_mobile);
        mJobSeekerEmailView = (TextView) findViewById(R.id.job_seeker_email);
        mJobSeekerCVView = findViewById(R.id.cv);
        mJobSeekerReferencesAvailableView = (TextView) findViewById(R.id.references_available);

        mJobSeekerEmailView.setText(LoginActivity.myEmail);
        mJobSeekerEmailView.setEnabled(false);

        mJobSeekerCVButton = (Button) findViewById(R.id.cv_button);
        mJobSeekerCVButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (jobSeeker.getCV() != null && !jobSeeker.getCV().isEmpty()) {
                    Intent i = new Intent(Intent.ACTION_VIEW);
                    i.setData(Uri.parse(jobSeeker.getCV()));
                    startActivity(i);
                }
            }
        });

        mJobSeekerSendMessageButton = (Button) findViewById(R.id.send_message_button);
        mJobSeekerSendMessageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (application != null) {
                    Intent intent = new Intent(JobSeekerDetailsActivity.this, ConversationThreadActivity.class);
                    intent.putExtra(ConversationThreadActivity.APPLICATION_ID, application.getId());
                    startActivity(intent);
                }
            }
        });

        mJobSeekerImageContainer.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (jobSeeker.hasPitch()) {
                    String video = jobSeeker.getPitch().getVideo();
                    Log.d(TAG, "playing video " + video);
                    Intent intent = new Intent(JobSeekerDetailsActivity.this, MediaPlayerActivity.class);
                    intent.putExtra("url", video);
                    startActivity(intent);
                }
            }
        });

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String jobSeekerData = savedInstanceState.getString(JOB_SEEKER_DATA);
                jobSeeker = mapper.readValue(jobSeekerData, JobSeeker.class);
                String jobData = savedInstanceState.getString(APPLICATION_DATA);
                if (jobData != null)
                    application = mapper.readValue(jobData, Application.class);
                updateUI();
                showProgress(false);
            } catch (IOException e) {
                Log.e(TAG, "Error", e);
            }
        } else if (getIntent().hasExtra(JOB_SEEKER_DATA)) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                jobSeeker = mapper.readValue(getIntent().getStringExtra(JOB_SEEKER_DATA), JobSeeker.class);
                if (getIntent().hasExtra(APPLICATION_DATA)) {
                    application = mapper.readValue(getIntent().getStringExtra(APPLICATION_DATA), Application.class);
                    updateUI();
                    showProgress(false);
                } else if (getIntent().hasExtra(APPLICATION_ID)) {
                    readApplication();
                } else {
                    updateUI();
                    showProgress(false);
                }
            } catch (IOException e) {
                Log.e(TAG, "JSON decode", e);
            }
        } else if (getIntent().hasExtra(JOB_SEEKER_ID)) {
            readJobSeeker();
        }
    }

    private void readJobSeeker() {
        ReadJobSeekerTask mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getIntent().getIntExtra(JOB_SEEKER_ID, -1));
        mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
            @Override
            public void onSuccess(JobSeeker result) {
                jobSeeker = result;
                if (getIntent().hasExtra(APPLICATION_ID)) {
                    readApplication();
                } else {
                    updateUI();
                    showProgress(false);
                }
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobSeekerDetailsActivity.this, "Error loading job seeker", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(JobSeekerDetailsActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        mReadJobSeekerTask.execute();
    }

    private void readApplication() {
        ReadApplicationTask readJobTask = new ReadApplicationTask(getApi(), getIntent().getIntExtra(APPLICATION_ID, -1));
        readJobTask.addListener(new CreateReadUpdateAPITaskListener<Application>() {

            @Override
            public void onSuccess(Application result) {
                application = result;
                updateUI();
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobSeekerDetailsActivity.this, "Error loading job details", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(JobSeekerDetailsActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
    }

    private void updateUI() {
        mJobSeekerNameView.setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());
        mJobSeekerDescriptionView.setText(jobSeeker.getDescription());

        String properties = "";
        boolean showAge = jobSeeker.getAge_public() && jobSeeker.getAge() != null;
        boolean showSex = jobSeeker.getSex_public() && jobSeeker.getSex() != null;
        if (showAge && showSex)
            properties = String.format("%s %s",
                    jobSeeker.getAge(),
                    getMJPApplication().get(Sex.class, jobSeeker.getSex()).getName());
        else if (showAge)
            properties = jobSeeker.getAge().toString();
        else if (showSex)
            properties = getMJPApplication().get(Sex.class, jobSeeker.getSex()).getName();
        mJobSeekerPropertiesView.setText(properties);

        String thumbnail = jobSeeker.getPitch().getThumbnail();
        if (thumbnail != null) {
            Uri uri = Uri.parse(thumbnail);
            DownloadImageTask task = new DownloadImageTask(this, mJobSeekerImageView, mJobSeekerImageProgressView);
            task.setListener(new DownloadImageTask.DownloadImageTaskListener() {
                @Override
                public void onComplete(Bitmap bitmap) {
                    mJobSeekerPlayButton.setVisibility(View.VISIBLE);
                }

                @Override
                public void onError() {
                    mJobSeekerImageProgressView.setVisibility(View.INVISIBLE);
                    mJobSeekerNoImageView.setVisibility(View.VISIBLE);
                }
            });
            task.executeOnExecutor(DownloadImageTask.executor, uri);
        } else {
            mJobSeekerImageProgressView.setVisibility(View.INVISIBLE);
            mJobSeekerNoImageView.setVisibility(View.VISIBLE);
        }

        ApplicationStatus establishedStatus = getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED);
        if (application != null && application.getStatus() != null && application.getStatus().equals(establishedStatus.getId())) {
            mJobSeekerNoContactView.setVisibility(View.GONE);
            mJobSeekerSendMessageButton.setVisibility(View.VISIBLE);

            if (jobSeeker.getTelephone_public() && jobSeeker.getTelephone() != null && !jobSeeker.getTelephone().isEmpty()) {
                mJobSeekerTelephoneView.setVisibility(View.VISIBLE);
                mJobSeekerTelephoneView.setText(Html.fromHtml(String.format("Phone: <u>%s</u>", jobSeeker.getTelephone())));
            } else {
                mJobSeekerTelephoneView.setVisibility(View.GONE);
            }
            if (jobSeeker.getMobile_public() && jobSeeker.getMobile() != null && !jobSeeker.getMobile().isEmpty()) {
                mJobSeekerMobileView.setVisibility(View.VISIBLE);
                mJobSeekerMobileView.setText(Html.fromHtml(String.format("Mobile: <u>%s</u>", jobSeeker.getMobile())));
            } else {
                mJobSeekerMobileView.setVisibility(View.GONE);
            }
            if (jobSeeker.getEmail_public()) {
                mJobSeekerEmailView.setVisibility(View.VISIBLE);
            } else {
                mJobSeekerEmailView.setVisibility(View.GONE);
            }
        } else {
            mJobSeekerNoContactView.setVisibility(View.VISIBLE);
            mJobSeekerTelephoneView.setVisibility(View.GONE);
            mJobSeekerMobileView.setVisibility(View.GONE);
            mJobSeekerEmailView.setVisibility(View.GONE);
            mJobSeekerSendMessageButton.setVisibility(View.GONE);
        }

        boolean hasCV = jobSeeker.getCV() != null && !jobSeeker.getCV().isEmpty();
        if (hasCV || jobSeeker.getHasReferences()) {
            mJobSeekerCVView.setVisibility(View.VISIBLE);
            if (hasCV)
                mJobSeekerCVButton.setVisibility(View.VISIBLE);
            else
                mJobSeekerCVButton.setVisibility(View.GONE);
            if (jobSeeker.getHasReferences())
                mJobSeekerReferencesAvailableView.setVisibility(View.VISIBLE);
            else
                mJobSeekerReferencesAvailableView.setVisibility(View.GONE);
        } else {
            mJobSeekerCVView.setVisibility(View.GONE);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString(JOB_SEEKER_DATA, mapper.writeValueAsString(jobSeeker));
            if (application != null)
                outState.putString(APPLICATION_DATA, mapper.writeValueAsString(application));
        } catch (JsonProcessingException e) {}
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        if (getIntent().hasExtra(APPLICATION_ID) || getIntent().hasExtra(APPLICATION_DATA)) {
            getMenuInflater().inflate(R.menu.job_seeker_details, menu);
            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                return true;
            case R.id.action_messages:
                Intent intent = new Intent(JobSeekerDetailsActivity.this, ConversationThreadActivity.class);
                intent.putExtra(ConversationThreadActivity.APPLICATION_ID, application.getId());
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mJobSeekerDetailsView;
    }
}
