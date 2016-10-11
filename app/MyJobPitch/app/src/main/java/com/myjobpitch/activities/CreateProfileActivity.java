package com.myjobpitch.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;

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
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.io.IOException;

public class CreateProfileActivity extends MJPProgressActionBarActivity {

    private View mCreateProfileButtons;
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

        mCreateProfileButtons = findViewById(R.id.create_profile_buttons);

        // Job seeker
        ImageButton mCreateJobSeekerButton = (ImageButton) findViewById(R.id.create_job_seeker);
        mCreateJobSeekerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                createJobSeeker();
            }
        });

        mJobSeekerProfile = findViewById(R.id.job_seeker_profile);
        mJobSeekerEditFragment = (JobSeekerEditFragment) getSupportFragmentManager().findFragmentById(R.id.job_seeker_edit_fragment);

        Button jobSeekerContinueButton = (Button) findViewById(R.id.continue_button_job_seeker);
        mJobSeekerEditFragment.mSaveButton = jobSeekerContinueButton;
        jobSeekerContinueButton.setEnabled(false);
        jobSeekerContinueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptJobSeekerContinue();
            }
        });
        MJPApplication application = (MJPApplication) getApplication();
        mJobSeekerEditFragment.loadApplicationData(application);

        // Recruiter
        ImageButton mCreateRecruiterButton = (ImageButton) findViewById(R.id.create_employer);
        mCreateRecruiterButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
            createRecruiter();
            }
        });

        mRecruiterProfile = findViewById(R.id.recruiter_profile);
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
        mProgressView = findViewById(R.id.progress);
        mCreateProfileView = findViewById(R.id.create_profile);


        business = new Business();
        //mBusinessEditFragment.load(business);

        location = new Location();
        //mLocationEditFragment.load(location);
    }

    private void attemptRecruiterContinue() {
        boolean result = mBusinessEditFragment.validateInput();
        result &= mLocationEditFragment.validateInput();
        if (result) {
            showProgress(true);

                mBusinessEditFragment.save(business);

                final MJPApi api = ((MJPApplication) getApplication()).getApi();
                mCreateBusinessTask = new CreateUpdateBusinessTask(api, business);
                mCreateBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
                @Override
                public void onSuccess(Business business) {
                    CreateProfileActivity.this.business = business;

                    final Uri imageUri = mBusinessEditFragment.getImageUri();
                    if (imageUri == null) {
                        // No change to image
                        saveLocation();
                    } else {
                        // Image changed
                        UploadImageTask uploadTask = new UploadImageTask(CreateProfileActivity.this, getApi(), "user-business-images", "business", imageUri, business);
                        uploadTask.addListener(new APITaskListener<Boolean>() {
                            @Override
                            public void onPostExecute(Boolean success) {
                                saveLocation();
                            }

                            @Override
                            public void onCancelled() {
                                showProgress(false);
                                Toast toast = Toast.makeText(CreateProfileActivity.this, "Error uploading company logo", Toast.LENGTH_LONG);
                                toast.show();
                            }
                        });
                        uploadTask.execute();
                    }

                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                }

                @Override
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(CreateProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateBusinessTask.execute();
        }
    }

    private void saveLocation() {
        location.setBusiness(business.getId());
        mLocationEditFragment.save(location);

        final MJPApi api = ((MJPApplication) getApplication()).getApi();
        mCreateLocationTask = mLocationEditFragment.getCreateLocationTask(api, location);
        mCreateLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
            @Override
            public void onSuccess(Location location) {
                CreateProfileActivity.this.location = location;

                final Uri imageUri = mLocationEditFragment.getImageUri();
                if (imageUri == null) {
                    // No change to image
                    returnToListActivity();
                } else {
                    // Image changed
                    UploadImageTask uploadTask = new UploadImageTask(CreateProfileActivity.this, getApi(), "user-location-images", "location", imageUri, location);
                    uploadTask.addListener(new APITaskListener<Boolean>() {
                        @Override
                        public void onPostExecute(Boolean success) {
                            returnToListActivity();
                        }

                        @Override
                        public void onCancelled() {
                            returnToListActivity();
                            Toast toast = Toast.makeText(CreateProfileActivity.this, "Error uploading location image", Toast.LENGTH_LONG);
                            toast.show();
                        }
                    });
                    uploadTask.execute();
                }

            }

            @Override
            public void onError(JsonNode errors) {
                showProgress(false);
            }

            @Override
            public void onConnectionError() {
                showProgress(false);
                Toast toast = Toast.makeText(CreateProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
            }

            @Override
            public void onCancelled() {
                showProgress(false);
            }
        });
        mCreateLocationTask.execute();
    }

    private void returnToListActivity() {
        Intent intent;
        boolean canCreateBusinesses = ((MJPApplication)getApplication()).getApi().getUser().getCan_create_businesses();
        if (canCreateBusinesses) {
            intent = new Intent(CreateProfileActivity.this, BusinessListActivity.class);
        } else {
            intent = new Intent(CreateProfileActivity.this, LocationListActivity.class);
            intent.putExtra(LocationListActivity.BUSINESS_ID, business.getId());
        }
        intent.putExtra("from_login", true);
        startActivity(intent);
        finish();
    }

    private void attemptJobSeekerContinue() {
        boolean result = mJobSeekerEditFragment.validateInput();
        if (result) {
            showProgress(true);
            final MJPApi api = ((MJPApplication) getApplication()).getApi();

            if (jobSeeker == null)
                jobSeeker = new JobSeeker();
            mJobSeekerEditFragment.save(jobSeeker);

            mCreateJobSeekerTask = mJobSeekerEditFragment.getCreateJobSeekerTask(api, jobSeeker);
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
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(CreateProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
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
        mCreateProfileButtons.setVisibility(View.GONE);
        mRecruiterProfile.setVisibility(View.VISIBLE);
        mJobSeekerProfile.setVisibility(View.GONE);
        getSupportActionBar().setTitle(getString(R.string.action_add_location));
    }

    private void createJobSeeker() {
        mCreateProfileButtons.setVisibility(View.GONE);
        mRecruiterProfile.setVisibility(View.GONE);
        mJobSeekerProfile.setVisibility(View.VISIBLE);
        getSupportActionBar().setTitle(getString(R.string.title_create_job_seeker));
    }

    @Override
    public View getMainView() {
        return mProgressView;
    }

    @Override
    public View getProgressView() {
        return mCreateProfileView;
    }

    @Override
    public void onBackPressed() {
        if (mRecruiterProfile.getVisibility() == View.VISIBLE) {
            mRecruiterProfile.setVisibility(View.GONE);
            mCreateProfileButtons.setVisibility(View.VISIBLE);
            getSupportActionBar().setTitle(getString(R.string.title_create_profile));
        } else if (mJobSeekerProfile.getVisibility() == View.VISIBLE) {
            mJobSeekerProfile.setVisibility(View.GONE);
            mCreateProfileButtons.setVisibility(View.VISIBLE);
            getSupportActionBar().setTitle(getString(R.string.title_create_profile));
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                onBackPressed();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
