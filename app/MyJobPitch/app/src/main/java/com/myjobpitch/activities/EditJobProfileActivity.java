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
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.fragments.JobProfileEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobProfileTask;
import com.myjobpitch.tasks.ReadJobSeekerTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobProfileTask;

public class EditJobProfileActivity extends MJPProgressActionBarActivity {

    private JobProfileEditFragment mJobProfileEditFragment;
    private View mEditJobProfileView;
    private View mProgressView;
    private JobSeeker mJobSeeker;
    private JobProfile mJobProfile;

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

        ReadJobSeekerTask mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getIntent().getIntExtra("job_seeker_id", -1));
        mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
            @Override
            public void onSuccess(JobSeeker result) {
                mJobSeeker = result;
                if (result.getProfile() != null) {
                    ReadJobProfileTask mReadJobProfileTask = new ReadJobProfileTask(getApi(), result.getProfile());
                    mReadJobProfileTask.addListener(new CreateReadUpdateAPITaskListener<JobProfile>() {
                        @Override
                        public void onSuccess(JobProfile result) {
                            mJobProfile = result;
                            mJobProfileEditFragment.load(result);
                            showProgress(false);
                        }

                        @Override
                        public void onError(JsonNode errors) {
                            Toast toast = Toast.makeText(EditJobProfileActivity.this, "Error loading job search profile", Toast.LENGTH_LONG);
                            toast.show();
                            finish();
                        }

                        @Override
                        public void onCancelled() {
                        }
                    });
                    mReadJobProfileTask.execute();
                } else {
                    mJobProfile = new JobProfile();
                    mJobProfile.setJob_seeker(mJobSeeker.getId());
                    showProgress(false);
                }
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(EditJobProfileActivity.this, "Error loading job search profile", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {

            }
        });
        mReadJobSeekerTask.execute();
    }

    private void attemptSave() {
        if (mJobProfileEditFragment.validateInput()) {
            showProgress(true);
            mJobProfileEditFragment.save(mJobProfile);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            CreateUpdateJobProfileTask mCreateUpdateJobProfileTask = new CreateUpdateJobProfileTask(api, mJobProfile);
            mCreateUpdateJobProfileTask.addListener(new CreateReadUpdateAPITaskListener<JobProfile>() {
                @Override
                public void onSuccess(JobProfile jobSeeker) {
                    EditJobProfileActivity.this.finish();
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditJobProfileActivity.this, "Error saving job search profile", Toast.LENGTH_LONG);
                    toast.show();
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
