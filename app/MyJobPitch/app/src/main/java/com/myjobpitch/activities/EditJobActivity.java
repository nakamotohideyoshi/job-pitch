package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.fragments.JobEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.recruiter.CreateUpdateJobTask;
import com.myjobpitch.tasks.recruiter.ReadUserJobTask;

import java.io.IOException;

public class EditJobActivity extends MJPProgressActionBarActivity {

    private JobEditFragment mJobEditFragment;
    private View mEditJobView;
    private Job job;
    private View mProgressView;
    private ReadUserJobTask mReadJobTask;
    private CreateUpdateJobTask mCreateUpdateJobTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job);

        mEditJobView = (View) findViewById(R.id.job_edit);
        mJobEditFragment = (JobEditFragment) getFragmentManager().findFragmentById(R.id.job_edit_fragment);
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        mJobEditFragment.loadApplicationData(getMJPApplication());

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String job_data = savedInstanceState.getString("job_data");
                Log.d("EditJobActivity", String.format("savedIntanceState['job_data']: %s", job_data));
                job = mapper.readValue(job_data, Job.class);
                mJobEditFragment.load(job);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditJobActivity", "Error", e);
            }
        } else if (getIntent().hasExtra("job_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                job = mapper.readValue(getIntent().getStringExtra("job_data"), Job.class);
                mJobEditFragment.load(job);
                showProgress(false);
            } catch (IOException e) {}
        } else if (getIntent().hasExtra("job_id")) {
            mReadJobTask = new ReadUserJobTask(getApi(), getIntent().getIntExtra("job_id", -1));
            mReadJobTask.addListener(new CreateReadUpdateAPITaskListener<Job>() {
                @Override
                public void onSuccess(Job result) {
                    job = result;
                    mJobEditFragment.load(job);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    finish();
                    Toast toast = Toast.makeText(EditJobActivity.this, "Error loading job", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobTask.execute();
        } else {
            setTitle(R.string.action_add_job);
            job = new Job();
            job.setLocation(getIntent().getIntExtra("location_id", -1));
            job.setStatus(getMJPApplication().get(JobStatus.class, "OPEN").getId());
            mJobEditFragment.load(job);
            showProgress(false);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mJobEditFragment.save(job);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("job_data", mapper.writeValueAsString(job));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {
        if (mJobEditFragment.validateInput()) {
            showProgress(true);
            mJobEditFragment.save(job);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobTask = new CreateUpdateJobTask(api, job);
            mCreateUpdateJobTask.addListener(new CreateReadUpdateAPITaskListener<Job>() {
                @Override
                public void onSuccess(Job job) {
                    EditJobActivity.this.finish();
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateJobTask.execute();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                intent = NavUtils.getParentActivityIntent(EditJobActivity.this);
                intent.putExtra("location_id", job.getLocation());
                startActivity(intent);
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
        return mEditJobView;
    }
}
