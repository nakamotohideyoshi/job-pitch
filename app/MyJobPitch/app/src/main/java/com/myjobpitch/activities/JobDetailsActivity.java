package com.myjobpitch.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.jobseeker.ReadJobTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateJobTask;

import java.io.IOException;

public class JobDetailsActivity extends MJPProgressActionBarActivity {

    public static final String JOB_DATA = "JOB_DATA";

    private View mJobDetailsView;
    private View mProgressView;
    private Job job;
    private ReadJobTask mReadJobTask;
    private TextView mJobTitleView;
    private TextView mJobDescriptionView;
    private TextView mJobLocationView;
    private TextView mJobPropertiesView;
    private ImageView mJobImageView;
    private ProgressBar mJobImageProgressView;
    private TextView mJobNoImageView;
    private TextView mJobLocationAddressView;
    private ImageButton mJobLocationMapButton;
    private TextView mJobLocationDescriptionView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_details);

        mJobDetailsView = findViewById(R.id.job_details);
        mProgressView = findViewById(R.id.progress);
        mJobTitleView = (TextView) findViewById(R.id.job_title);
        mJobDescriptionView = (TextView) findViewById(R.id.job_description);
        mJobLocationView = (TextView) findViewById(R.id.job_location);
        mJobPropertiesView = (TextView) findViewById(R.id.job_properties);
        mJobImageView = (ImageView) findViewById(R.id.image);
        mJobImageProgressView = (ProgressBar) findViewById(R.id.image_progress);
        mJobNoImageView = (TextView) findViewById(R.id.no_image);
        mJobLocationAddressView = (TextView) findViewById(R.id.job_location_address);
        mJobLocationDescriptionView = (TextView) findViewById(R.id.job_location_description);
        mJobLocationMapButton = (ImageButton) findViewById(R.id.location_map_button);
        mJobLocationMapButton.setEnabled(false);
        mJobLocationMapButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Uri gmmIntentUri = Uri.parse(String.format(
                        "geo:0,0?q=%s,%s(%s)",
                        job.getLocation_data().getLatitude(),
                        job.getLocation_data().getLongitude(),
                        job.getLocation_data().getName()));
                Intent mapIntent = new Intent(Intent.ACTION_VIEW, gmmIntentUri);
                mapIntent.setPackage("com.google.android.apps.maps");
                startActivity(mapIntent);
            }
        });

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String job_data = savedInstanceState.getString(JOB_DATA);
                job = mapper.readValue(job_data, Job.class);
                loadJob();
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditJobActivity", "Error", e);
            }
        } else if (getIntent().hasExtra(JOB_DATA)) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                job = mapper.readValue(getIntent().getStringExtra(JOB_DATA), Job.class);
                loadJob();
                showProgress(false);
            } catch (IOException e) {}
        } else {
            mReadJobTask = new ReadJobTask(getApi(), getIntent().getIntExtra("job_id", -1));
            mReadJobTask.addListener(new CreateReadUpdateAPITaskListener<Job>() {
                @Override
                public void onSuccess(Job result) {
                    job = result;
                    loadJob();
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    Toast toast = Toast.makeText(JobDetailsActivity.this, "Error loading job", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onConnectionError() {
                    Toast toast = Toast.makeText(JobDetailsActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobTask.execute();
        }

        if (getIntent().getBooleanExtra("showApplyButton", false)) {
            Button applyBtn = (Button)findViewById(R.id.apply_btn);
            applyBtn.setVisibility(View.VISIBLE);
            applyBtn.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    Intent intent = getIntent();
                    intent.putExtra("apply", true);
                    setResult(RESULT_OK, intent);
                    JobDetailsActivity.this.finish();
                }
            });
        }
    }

    private void loadJob() {
        mJobTitleView.setText(job.getTitle());
        mJobDescriptionView.setText(job.getDescription());

        String location = String.format("%s - %s",
            job.getLocation_data().getBusiness_data().getName(),
            job.getLocation_data().getName());
        mJobLocationView.setText(location);

        String properties = getMJPApplication().get(Hours.class, job.getHours()).getName();
        Contract contract = getMJPApplication().get(Contract.class, job.getContract());
        if (!contract.equals(getMJPApplication().get(Contract.class, Contract.PERMANENT)))
            properties += " (" + contract.getShort_name() + ")";
        mJobPropertiesView.setText(properties);

        Image image = null;
        if (job.getImages() != null && !job.getImages().isEmpty())
            image = job.getImages().get(0);
        else if (job.getLocation_data().getImages() != null && !job.getLocation_data().getImages().isEmpty())
            image = job.getLocation_data().getImages().get(0);
        else if (job.getLocation_data().getBusiness_data().getImages() != null && !job.getLocation_data().getBusiness_data().getImages().isEmpty())
            image = job.getLocation_data().getBusiness_data().getImages().get(0);
        if (image != null) {
            Uri uri = Uri.parse(image.getThumbnail());
            new DownloadImageTask(this, mJobImageView, mJobImageProgressView).executeOnExecutor(DownloadImageTask.executor, uri);
        } else {
            mJobImageProgressView.setVisibility(View.INVISIBLE);
           // mJobNoImageView.setVisibility(View.VISIBLE);
            mJobImageView.setImageResource(R.drawable.default_logo);
        }

        mJobLocationAddressView.setText(String.format(
                "%s\n%s",
                job.getLocation_data().getName(),
                job.getLocation_data().getAddress()));

        mJobLocationMapButton.setEnabled(true);

        mJobLocationDescriptionView.setText(job.getLocation_data().getDescription());
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString(JOB_DATA, mapper.writeValueAsString(job));
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
        return mJobDetailsView;
    }
}
