package com.myjobpitch.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.fragments.JobProfileEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobProfileTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobProfileTask;

public class EditJobProfileActivity extends MJPProgressActionBarActivity {

    private JobProfileEditFragment mJobProfileEditFragment;
    private View mEditJobProfileView;
    private JobProfile jobProfile;
    private View mProgressView;
    private ReadJobProfileTask mReadJobProfileTask;
    private CreateUpdateJobProfileTask mCreateUpdateJobProfileTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job_profile);

        mEditJobProfileView = (View) findViewById(R.id.job_profile_edit);
        mJobProfileEditFragment = (JobProfileEditFragment) getFragmentManager().findFragmentById(R.id.job_profile_edit_fragment);
        mJobProfileEditFragment.loadApplicationData(getMJPApplication());
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        if (getIntent().hasExtra("job_profile_id")) {
            mReadJobProfileTask = new ReadJobProfileTask(getApi(), getIntent().getIntExtra("job_profile_id", -1));
            mReadJobProfileTask.addListener(new CreateReadUpdateAPITaskListener<JobProfile>() {
                @Override
                public void onSuccess(JobProfile result) {
                    jobProfile = result;
                    mJobProfileEditFragment.load(jobProfile);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    finish();
                    Toast toast = Toast.makeText(EditJobProfileActivity.this, "Error loading job search profile", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobProfileTask.execute();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
    }

    private void attemptSave() {
        if (mJobProfileEditFragment.validateInput()) {
            showProgress(true);

            mJobProfileEditFragment.save(jobProfile);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobProfileTask = new CreateUpdateJobProfileTask(api, jobProfile);
            mCreateUpdateJobProfileTask.addListener(new CreateReadUpdateAPITaskListener<JobProfile>() {
                @Override
                public void onSuccess(JobProfile jobSeeker) {
                    EditJobProfileActivity.this.finish();
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
            mCreateUpdateJobProfileTask.execute();
        }
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mEditJobProfileView;
    }
}
