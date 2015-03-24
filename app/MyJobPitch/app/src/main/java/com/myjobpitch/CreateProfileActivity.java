package com.myjobpitch;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;

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

        Button continueButton = (Button) findViewById(R.id.continue_button);
        continueButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptContinue();
            }
        });

        mProgressView = findViewById(R.id.create_profile_progress);
        mCreateProfileView = findViewById(R.id.create_profile);
    }

    private void attemptContinue() {
        boolean result = mBusinessEditFragment.validateInput();
        result &= mLocationEditFragment.validateInput();
        if (result) {
            if (business == null)
                business = new Business();
            mBusinessEditFragment.save(business);
            mCreateBusinessTask = new CreateBusinessTask();
            mCreateBusinessTask.execute();
        }
    }

    private void createRecruiter() {
        mRecruiterProfile.setVisibility(View.VISIBLE);
    }

    private void createJobSeeker() {
    }

    /**
     * Shows the progress UI and hides the login form.
     */
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

    public class CreateBusinessTask extends AsyncTask<Void, Void, Void> {
        private JsonNode errors;

        @Override
        protected Void doInBackground(Void... params) {
            try {
                MJPApi api = ((MjpApplication) getApplication()).getApi();
                if (business.getId() == null)
                    business = api.createBusiness(business);
                else
                    business = api.updateBusiness(business);
            } catch (MJPApiException e) {
                errors = e.getErrors();
                Log.d("CreateBusiness", errors.toString());
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Void __) {
            mCreateBusinessTask = null;

            if (errors == null) {
                if (location == null)
                    location = new Location();
                location.setBusiness(business.getId());
                mLocationEditFragment.save(location);
                mCreateLocationTask = new CreateLocationTask();
                mCreateLocationTask.execute();
            } else {
                showProgress(false);
            }
        }

        @Override
        protected void onCancelled() {
            mCreateBusinessTask = null;
            showProgress(false);
        }
    }

    public class CreateLocationTask extends AsyncTask<Void, Void, Void> {
        private JsonNode errors;

        @Override
        protected Void doInBackground(Void... params) {
            try {
                MJPApi api = ((MjpApplication) getApplication()).getApi();
                if (location.getId() == null)
                    location = api.createLocation(location);
                else
                    location = api.updateLocation(location);
            } catch (MJPApiException e) {
                errors = e.getErrors();
                Log.d("CreateLocation", errors.toString());
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Void __) {
            mCreateLocationTask = null;
            if (errors == null) {

            } else {

            }
            showProgress(false);
        }

        @Override
        protected void onCancelled() {
            mCreateLocationTask = null;
            showProgress(false);
        }
    }
}
