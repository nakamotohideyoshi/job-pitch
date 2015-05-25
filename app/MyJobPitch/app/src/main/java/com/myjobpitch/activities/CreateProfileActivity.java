package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.BusinessEditFragment;
import com.myjobpitch.fragments.JobSeekerEditFragment;
import com.myjobpitch.fragments.LocationEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.io.IOException;

public class CreateProfileActivity extends MJPProgressActionBarActivity {

    private LocationEditFragment mLocationEditFragment;
    private BusinessEditFragment mBusinessEditFragment;
    private View mRecruiterProfile;
    private View mJobSeekerProfile;
    private JobSeeker jobSeeker;
    private Business business;
    private Location location;
    private View mProgressView;
    private View mCreateProfileView;
    private CreateUpdateBusinessTask mCreateBusinessTask;
    private CreateUpdateLocationTask mCreateLocationTask;
    private JobSeekerEditFragment mJobSeekerEditFragment;
    private CreateUpdateJobSeekerTask mCreateJobSeekerTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_profile);

        // Job seeker
        Button mCreateJobSeekerButton = (Button) findViewById(R.id.create_job_seeker);
        mCreateJobSeekerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                createJobSeeker();
            }
        });

        mJobSeekerProfile = (View) findViewById(R.id.job_seeker_profile);
        mJobSeekerEditFragment = (JobSeekerEditFragment) getSupportFragmentManager().findFragmentById(R.id.job_seeker_edit_fragment);

        Button jobSeekerContinueButton = (Button) findViewById(R.id.continue_button_job_seeker);
        jobSeekerContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptJobSeekerContinue();
            }
        });
        MJPApplication application = (MJPApplication) getApplication();
        mJobSeekerEditFragment.loadApplicationData(application);

        // Recruiter
        Button mCreateRecruiterButton = (Button) findViewById(R.id.create_employer);
        mCreateRecruiterButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
            createRecruiter();
            }
        });

        mRecruiterProfile = (View) findViewById(R.id.recruiter_profile);
        mBusinessEditFragment = (BusinessEditFragment) getSupportFragmentManager().findFragmentById(R.id.business_edit_fragment);
        mLocationEditFragment = (LocationEditFragment) getSupportFragmentManager().findFragmentById(R.id.location_edit_fragment);
        if (getIntent().hasExtra("email"))
            mLocationEditFragment.setEmail(getIntent().getStringExtra("email"));

        Button recruiterContinueButton = (Button) findViewById(R.id.continue_button_recruiter);
        recruiterContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptRecruiterContinue();
            }
        });

        // Test if we are half-way through creating a recruiter
        if (getIntent().hasExtra("business_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                business = mapper.readValue(getIntent().getStringExtra("business_data"), Business.class);
                mBusinessEditFragment.load(business);
                createRecruiter();
            } catch (IOException e) {}
        }

        // General views
        mProgressView = findViewById(R.id.create_profile_progress);
        mCreateProfileView = findViewById(R.id.create_profile);
    }

    private void attemptRecruiterContinue() {
        boolean result = mBusinessEditFragment.validateInput();
        result &= mLocationEditFragment.validateInput();
        if (result) {
            showProgress(true);
                if (business == null)
                business = new Business();
                mBusinessEditFragment.save(business);

                final MJPApi api = ((MJPApplication) getApplication()).getApi();
                mCreateBusinessTask = new CreateUpdateBusinessTask(api, business);
                mCreateBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
                @Override
                public void onSuccess(Business business) {
                    CreateProfileActivity.this.business = business;

                    if (location == null)
                        location = new Location();
                    location.setBusiness(business.getId());
                    mLocationEditFragment.save(location);
                    mCreateLocationTask = mLocationEditFragment.getCreateLocationTask(api, location);
                    mCreateLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
                        @Override
                        public void onSuccess(Location location) {
                            CreateProfileActivity.this.location = location;

                            Intent intent = new Intent(CreateProfileActivity.this, BusinessListActivity.class);
                            intent.putExtra("from_login", true);
                            startActivity(intent);
                            finish();
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
                    mCreateLocationTask.execute();
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
            mCreateBusinessTask.execute();
        }
    }

    private void attemptJobSeekerContinue() {
        boolean result = mJobSeekerEditFragment.validateInput();
        if (result) {
            showProgress(true);
            final MJPApi api = ((MJPApplication) getApplication()).getApi();

            if (jobSeeker == null)
                jobSeeker = new JobSeeker();
            User user = api.getUser();
            mJobSeekerEditFragment.save(jobSeeker);

            mCreateJobSeekerTask = mJobSeekerEditFragment.getCreateBusinessTask(api, jobSeeker);
            mCreateJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker jobSeeker) {
                    CreateProfileActivity.this.jobSeeker = jobSeeker;
                    getApi().getUser().setJob_seeker(jobSeeker.getId());

                    Intent intent = new Intent(CreateProfileActivity.this, JobSeekerActivity.class);
                    intent.putExtra("from_login", true);
                    startActivity(intent);
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
            mCreateJobSeekerTask.execute();
        }
    }

    private void createRecruiter() {
        mRecruiterProfile.setVisibility(View.VISIBLE);
    }

    private void createJobSeeker() {
        mJobSeekerProfile.setVisibility(View.VISIBLE);
    }

    @Override
    public View getMainView() {
        return mProgressView;
    }

    @Override
    public View getProgressView() {
        return mCreateProfileView;
    }
}
