package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
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
import com.myjobpitch.tasks.ReadLocationTask;
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

    private MJPApi api,api1;

    private ReadLocationTask mReadLocationTask;
    public static final String LOCATION_ID = "LOCATION_ID";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_profile);

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


//        //julia_kata
//        if (savedInstanceState != null) {
//            ObjectMapper mapper = new ObjectMapper();
//            try {
//                String location_data = savedInstanceState.getString("location_data");
//                Log.d("EditLocationActivity", String.format("savedIntanceState['location_data']: %s", location_data));
//                location = mapper.readValue(location_data, Location.class);
//                mLocationEditFragment.load(location);
//                showProgress(false);
//            } catch (IOException e) {
//                Log.e("EditLocationActivity", "Error", e);
//            }
//        } else if (getIntent().hasExtra("location_data")) {
//            ObjectMapper mapper = new ObjectMapper();
//            try {
//                location = mapper.readValue(getIntent().getStringExtra("location_data"), Location.class);
//                mLocationEditFragment.load(location);
//                showProgress(false);
//            } catch (IOException e) {}
//        } else if (getIntent().hasExtra(LOCATION_ID)) {
//            mReadLocationTask = new ReadLocationTask(getApi(), getIntent().getIntExtra(LOCATION_ID, -1));
//            mReadLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
//                @Override
//                public void onSuccess(Location result) {
//                    location = result;
//                    mLocationEditFragment.load(location);
//                    showProgress(false);
//                }
//
//                @Override
//                public void onError(JsonNode errors) {
//                    Toast toast = Toast.makeText(CreateProfileActivity.this, "Error loading location", Toast.LENGTH_LONG);
//                    toast.show();
//                    finish();
//                }
//
//                @Override
//                public void onConnectionError() {
//                    Toast toast = Toast.makeText(CreateProfileActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
//                    toast.show();
//                    finish();
//                }
//
//                @Override
//                public void onCancelled() {
//                }
//            });
//            mReadLocationTask.execute();
//        } else {
//            showProgress(false);
//            setTitle(R.string.action_add_location);
//            location = new Location();
//            location.setBusiness(getIntent().getIntExtra("business_id", -1));
//            mLocationEditFragment.load(location);
//        }
//        /////////////////////////////////////////////////////////////////////////////////////////////////////

    }

    private void attemptRecruiterContinue() {
        boolean result = mBusinessEditFragment.validateInput();
        result &= mLocationEditFragment.validateInput();

        if (result) {
            showProgress(true);



                api = ((MJPApplication) getApplication()).getApi();

                if (business == null)
                    business = new Business();
                mBusinessEditFragment.save(business);
                mCreateBusinessTask = new CreateUpdateBusinessTask(api, business);
                mCreateBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
                @Override
                public void onSuccess(Business business) {
                    CreateProfileActivity.this.business = business;

                    if (location == null)
                        location = new Location();

                    location.setBusiness(business.getId());
                    mLocationEditFragment.save(location);
                    api = ((MJPApplication) getApplication()).getApi();
                    //mCreateLocationTask = mLocationEditFragment.getCreateLocationTask(api, location);
                    mCreateLocationTask = new CreateUpdateLocationTask(api, location);


                    Log.e("success","success!!!");
                    Intent intent = new Intent(CreateProfileActivity.this, BusinessListActivity.class);
                    //intent.putExtra("from_login", true);
                    //intent.putExtra(LOCATION_ID, location.getId());
                    intent.putExtra(LOCATION_ID, true);
                    startActivity(intent);
                    CreateProfileActivity.this.finish();

                    mCreateLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
                        @Override
                        public void onSuccess(Location location) {
//                            CreateProfileActivity.this.location = location;
//                            Log.e("success","success---888!!!");
//                            Intent intent = new Intent(CreateProfileActivity.this, BusinessListActivity.class);
//                            //intent.putExtra("from_login", true);
//                            intent.putExtra(LOCATION_ID, true);
//                            startActivity(intent);
//                            //CreateProfileActivity.this.finish();

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

    private void attemptJobSeekerContinue() {
        boolean result = mJobSeekerEditFragment.validateInput();
        if (result) {
            showProgress(true);
            //final MJPApi api = ((MJPApplication) getApplication()).getApi();
            api = ((MJPApplication) getApplication()).getApi();

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
        mRecruiterProfile.setVisibility(View.VISIBLE);
        mJobSeekerProfile.setVisibility(View.GONE);
    }

    private void createJobSeeker() {
        mRecruiterProfile.setVisibility(View.GONE);
        mJobSeekerProfile.setVisibility(View.VISIBLE);
    }

//    @Override
//    protected void onSaveInstanceState(Bundle outState) {
//        super.onSaveInstanceState(outState);
//        mLocationEditFragment.save(location);
//        ObjectMapper mapper = new ObjectMapper();
//        try {
//            outState.putString("location_data", mapper.writeValueAsString(location));
//        } catch (JsonProcessingException e) {}
//    }


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
        if (mRecruiterProfile.getVisibility() == View.VISIBLE)
            mRecruiterProfile.setVisibility(View.GONE);
        else if (mJobSeekerProfile.getVisibility() == View.VISIBLE)
            mJobSeekerProfile.setVisibility(View.GONE);
        else
            super.onBackPressed();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                if (mRecruiterProfile.getVisibility() == View.VISIBLE) {
                    mRecruiterProfile.setVisibility(View.GONE);
                    return true;
                } else if (mJobSeekerProfile.getVisibility() == View.VISIBLE) {
                    mJobSeekerProfile.setVisibility(View.GONE);
                    return true;
                }
        }
        return super.onOptionsItemSelected(item);
    }
}
