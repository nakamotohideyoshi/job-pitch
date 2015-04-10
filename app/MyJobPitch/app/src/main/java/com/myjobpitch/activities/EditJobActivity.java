package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.fragments.JobEditFragment;
import com.myjobpitch.tasks.CreateUpdateJobTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadJobTask;

import java.io.IOException;

public class EditJobActivity extends MJPActionBarActivity implements JobEditFragment.JobEditHost {

    private JobEditFragment mJobEditFragment;
    private View mEditJobView;
    private Integer location_id;
    private Job job;
    private View mProgressView;
    private ReadJobTask mReadJobTask;
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

        if (getIntent().hasExtra("job_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                job = mapper.readValue(getIntent().getStringExtra("job_data"), Job.class);
                mJobEditFragment.load(job);
                showProgress(false);
            } catch (IOException e) {}
        } else if (getIntent().hasExtra("job_id")) {
            mReadJobTask = new ReadJobTask(getApi(), getIntent().getIntExtra("job_id", -1));
            mReadJobTask.addListener(new ReadAPITask.Listener<Job>() {
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
            location_id = getIntent().getIntExtra("location_id", -1);
            showProgress(false);
            setTitle(R.string.action_add_job);
            job = new Job();
            job.setLocation(location_id);
            job.setStatus(getMJPApplication().getJobStatus("OPEN").getId());
            mJobEditFragment.load(job);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
    }

    private void attemptSave() {
        if (mJobEditFragment.validateInput()) {
            showProgress(true);

            if (job == null) {
                job = new Job();
                job.setLocation(location_id);
            }
            mJobEditFragment.save(job);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobTask = new CreateUpdateJobTask(api, job);
            mCreateUpdateJobTask.addListener(new CreateUpdateJobTask.Listener<Job>() {
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

    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR2) {
            int shortAnimTime = getResources().getInteger(android.R.integer.config_shortAnimTime);

            mEditJobView.setVisibility(show ? View.GONE : View.VISIBLE);
            mEditJobView.animate().setDuration(shortAnimTime).alpha(
                    show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mEditJobView.setVisibility(show ? View.GONE : View.VISIBLE);
                }
            });

            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mProgressView.animate().setDuration(shortAnimTime).alpha(
                    show ? 1 : 0).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
                }
            });
        } else {
            // The ViewPropertyAnimator APIs are not available, so simply show
            // and hide the relevant UI components.
            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mEditJobView.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
}
