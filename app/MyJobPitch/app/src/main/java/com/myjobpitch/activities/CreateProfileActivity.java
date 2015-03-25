package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.BusinessEditFragment;
import com.myjobpitch.fragments.LocationEditFragment;
import com.myjobpitch.tasks.CreateBusinessTask;
import com.myjobpitch.tasks.CreateLocationTask;

import java.io.IOException;

public class CreateProfileActivity extends ActionBarActivity implements BusinessEditFragment.BusinessEditHost, LocationEditFragment.LocationEditHost {

    private LocationEditFragment mLocationEditFragment;
    private BusinessEditFragment mBusinessEditFragment;
    private View mRecruiterProfile;
    private Business business;
    private Location location;
    private View mProgressView;
    private View mCreateProfileView;
    private CreateBusinessTask mCreateBusinessTask;
    private CreateLocationTask mCreateLocationTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_profile);

        Button mCreateJobSeekerButton = (Button) findViewById(R.id.create_job_seeker);
        mCreateJobSeekerButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                createJobSeeker();
            }
        });

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

        Button continueButton = (Button) findViewById(R.id.continue_button);
        continueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptContinue();
            }
        });

        if (getIntent().hasExtra("business_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                business = mapper.readValue(getIntent().getStringExtra("business_data"), Business.class);
                mBusinessEditFragment.load(business);
                createRecruiter();
            } catch (IOException e) {}
        }

        mProgressView = findViewById(R.id.create_profile_progress);
        mCreateProfileView = findViewById(R.id.create_profile);
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
    }

    private void attemptContinue() {
        boolean result = mBusinessEditFragment.validateInput();
        result &= mLocationEditFragment.validateInput();
        if (result) {
            showProgress(true);

            if (business == null)
                business = new Business();
            mBusinessEditFragment.save(business);

            final MJPApi api = ((MjpApplication) getApplication()).getApi();
            mCreateBusinessTask = new CreateBusinessTask(api, business);
            mCreateBusinessTask.addListener(new CreateBusinessTask.Listener() {
                @Override
                public void onSuccess(Business business) {
                    CreateProfileActivity.this.business = business;

                    if (location == null)
                        location = new Location();
                    location.setBusiness(business.getId());
                    mLocationEditFragment.save(location);
                    mCreateLocationTask = mLocationEditFragment.getCreateLocationTask(api, location);
                    mCreateLocationTask.addListener(new CreateLocationTask.Listener() {
                        @Override
                        public void onSuccess(Location location) {
                            CreateProfileActivity.this.location = location;

                            Intent intent = new Intent(CreateProfileActivity.this, RecruiterActivity.class);
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

    private void createRecruiter() {
        mRecruiterProfile.setVisibility(View.VISIBLE);
    }

    private void createJobSeeker() {
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

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
