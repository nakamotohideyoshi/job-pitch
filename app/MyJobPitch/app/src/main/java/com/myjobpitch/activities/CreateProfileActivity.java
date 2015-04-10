package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
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
import com.myjobpitch.tasks.CreateUpdateAPITask;
import com.myjobpitch.tasks.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.CreateUpdateJobSeekerTask;
import com.myjobpitch.tasks.CreateUpdateLocationTask;
import com.myjobpitch.tasks.UpdateUserTask;

import java.io.IOException;

public class CreateProfileActivity extends ActionBarActivity implements BusinessEditFragment.BusinessEditHost, LocationEditFragment.LocationEditHost {

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
    private UpdateUserTask mUpdateUserTask;

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
        mJobSeekerEditFragment = (JobSeekerEditFragment) getFragmentManager().findFragmentById(R.id.job_seeker_edit_fragment);

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
        mBusinessEditFragment = (BusinessEditFragment) getFragmentManager().findFragmentById(R.id.business_edit_fragment);
        mLocationEditFragment = (LocationEditFragment) getFragmentManager().findFragmentById(R.id.location_edit_fragment);
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

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
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
                mCreateBusinessTask.addListener(new CreateUpdateBusinessTask.Listener<Business>() {
                @Override
                public void onSuccess(Business business) {
                    CreateProfileActivity.this.business = business;

                    if (location == null)
                        location = new Location();
                    location.setBusiness(business.getId());
                    mLocationEditFragment.save(location);
                    mCreateLocationTask = mLocationEditFragment.getCreateLocationTask(api, location);
                    mCreateLocationTask.addListener(new CreateUpdateLocationTask.Listener<Location>() {
                        @Override
                        public void onSuccess(Location location) {
                            CreateProfileActivity.this.location = location;

                            Intent intent = new Intent(CreateProfileActivity.this, BusinessListActivity.class);
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
            mCreateJobSeekerTask.addListener(new CreateUpdateJobSeekerTask.Listener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker jobSeeker) {
                    CreateProfileActivity.this.jobSeeker = jobSeeker;

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

    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR2) {
            int shortAnimTime = getResources().getInteger(android.R.integer.config_shortAnimTime);

            mCreateProfileView.setVisibility(show ? View.GONE : View.VISIBLE);
            mCreateProfileView.animate().setDuration(shortAnimTime).alpha(
                    show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mCreateProfileView.setVisibility(show ? View.GONE : View.VISIBLE);
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
            mCreateProfileView.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
}
