package com.myjobpitch.activities;

import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.R;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadJobSeekerTask;

import java.io.IOException;

public class JobSeekerDetailsActivity extends MJPProgressActionBarActivity {

    private static final String TAG = "JobSeekerDetails";

    public static final String JOB_ID = "job_id";
    public static final String JOB_SEEKER_DATA = "JOB_SEEKER_DATA";

    private View mJobSeekerDetailsView;
    private View mProgressView;
    private JobSeeker jobSeeker;
    private ReadJobSeekerTask mReadJobSeekerTask;
    private TextView mJobSeekerNameView;
    private TextView mJobSeekerDescriptionView;
    private TextView mJobSeekerPropertiesView;
    private ImageView mJobSeekerImageView;
    private ProgressBar mJobSeekerImageProgressView;
    private TextView mJobSeekerNoImageView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_seeker_details);

        mJobSeekerDetailsView = findViewById(R.id.job_seeker_details);
        mProgressView = findViewById(R.id.progress);
        mJobSeekerNameView = (TextView) findViewById(R.id.job_seeker_name);
        mJobSeekerDescriptionView = (TextView) findViewById(R.id.job_seeker_description);
        mJobSeekerPropertiesView = (TextView) findViewById(R.id.job_properties);
        mJobSeekerImageView = (ImageView) findViewById(R.id.image);
        mJobSeekerImageProgressView = (ProgressBar) findViewById(R.id.image_progress);
        mJobSeekerNoImageView = (TextView) findViewById(R.id.no_image);

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String jobSeekerData = savedInstanceState.getString(JOB_SEEKER_DATA);
                jobSeeker = mapper.readValue(jobSeekerData, JobSeeker.class);
                loadJobSeeker();
                showProgress(false);
            } catch (IOException e) {
                Log.e(TAG, "Error", e);
            }
        } else if (getIntent().hasExtra(JOB_SEEKER_DATA)) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                jobSeeker = mapper.readValue(getIntent().getStringExtra(JOB_SEEKER_DATA), JobSeeker.class);
                loadJobSeeker();
                showProgress(false);
            } catch (IOException e) {
                Log.e(TAG, "JSON decode", e);
            }
        } else {
            mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getIntent().getIntExtra(JOB_ID, -1));
            mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker result) {
                    jobSeeker = result;
                    loadJobSeeker();
                    showProgress(false);
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
                public void onCancelled() {
                }
            });
            mReadJobSeekerTask.execute();
        }
    }

    private void loadJobSeeker() {
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
            new DownloadImageTask(this, mJobSeekerImageView, mJobSeekerImageProgressView).execute(uri);
        } else {
            mJobSeekerImageProgressView.setVisibility(View.INVISIBLE);
            mJobSeekerNoImageView.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString(JOB_SEEKER_DATA, mapper.writeValueAsString(jobSeeker));
        } catch (JsonProcessingException e) {}
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
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
