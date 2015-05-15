package com.myjobpitch.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.fragments.JobSeekerEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobSeekerTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;

public class EditJobSeekerActivity extends MJPProgressActionBarActivity {

    private JobSeekerEditFragment mJobSeekerEditFragment;
    private View mEditJobSeekerView;
    private JobSeeker jobSeeker;
    private View mProgressView;
    private ReadJobSeekerTask mReadJobSeekerTask;
    private CreateUpdateJobSeekerTask mCreateUpdateJobSeekerTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job_seeker);

        mEditJobSeekerView = (View) findViewById(R.id.job_seeker_edit);
        mJobSeekerEditFragment = (JobSeekerEditFragment) getFragmentManager().findFragmentById(R.id.job_seeker_edit_fragment);
        mJobSeekerEditFragment.loadApplicationData(getMJPApplication());
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        if (getIntent().hasExtra("job_seeker_id")) {
            mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getIntent().getIntExtra("job_seeker_id", -1));
            mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker result) {
                    jobSeeker = result;
                    mJobSeekerEditFragment.load(jobSeeker);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    finish();
                    Toast toast = Toast.makeText(EditJobSeekerActivity.this, "Error loading job seeker", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobSeekerTask.execute();
        }
    }

    private void attemptSave() {
        if (mJobSeekerEditFragment.validateInput()) {
            showProgress(true);

            mJobSeekerEditFragment.save(jobSeeker);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobSeekerTask = new CreateUpdateJobSeekerTask(api, jobSeeker);
            mCreateUpdateJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker jobSeeker) {
                    EditJobSeekerActivity.this.finish();
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
            mCreateUpdateJobSeekerTask.execute();
        }
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mEditJobSeekerView;
    }
}
