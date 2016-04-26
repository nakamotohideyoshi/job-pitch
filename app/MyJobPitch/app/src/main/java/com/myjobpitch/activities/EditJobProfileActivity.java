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
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.fragments.JobProfileEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobProfileTask;
import com.myjobpitch.tasks.ReadJobSeekerTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobProfileTask;

import java.io.IOException;

public class EditJobProfileActivity extends MJPProgressActionBarActivity {

    private JobProfileEditFragment mJobProfileEditFragment;
    private View mEditJobProfileView;
    private View mProgressView;
    private JobSeeker mJobSeeker;
    private JobProfile mJobProfile;
    private CreateUpdateJobProfileTask mCreateUpdateJobProfileTask;
    private ReadJobSeekerTask mReadJobSeekerTask;
    private ReadJobProfileTask mReadJobProfileTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job_profile);

        mEditJobProfileView = (View) findViewById(R.id.job_profile_edit);
        mJobProfileEditFragment = (JobProfileEditFragment) getSupportFragmentManager().findFragmentById(R.id.job_profile_edit_fragment);
        mJobProfileEditFragment.loadApplicationData(getMJPApplication());
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });
        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String job_seeker_data = savedInstanceState.getString("job_seeker_data");
                Log.d("EditJobProfileActivity", String.format("savedIntanceState['job_seeker_data']: %s", job_seeker_data));
                mJobSeeker = mapper.readValue(job_seeker_data, JobSeeker.class);

                String profile_data = savedInstanceState.getString("profile_data");
                Log.d("EditJobProfileActivity", String.format("savedIntanceState['profile_data']: %s", profile_data));
                mJobProfile = mapper.readValue(profile_data, JobProfile.class);
                mJobProfileEditFragment.load(mJobProfile);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditJobProfileActivity", "Error", e);
            }


        } else {
            //mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getIntent().getIntExtra("job_seeker_id", -1));
            mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getApi().getUser().getJob_seeker());//julia_kata
            mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker result) {
                    mJobSeeker = result;
                    if (result.getProfile() != null) {
                        mReadJobProfileTask= new ReadJobProfileTask(getApi(), result.getProfile());
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
                            public void onConnectionError() {
                                Toast toast = Toast.makeText(EditJobProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
                public void onConnectionError() {
                    Toast toast = Toast.makeText(EditJobProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mJobProfileEditFragment.save(mJobProfile);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("job_seeker_data", mapper.writeValueAsString(mJobSeeker));
            outState.putString("profile_data", mapper.writeValueAsString(mJobProfile));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {
        if (mJobProfileEditFragment.validateInput()) {
            showProgress(true);
            mJobProfileEditFragment.save(mJobProfile);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobProfileTask = new CreateUpdateJobProfileTask(api, mJobProfile);
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
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditJobProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(EditJobProfileActivity.this);
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
        return mEditJobProfileView;
    }
}
