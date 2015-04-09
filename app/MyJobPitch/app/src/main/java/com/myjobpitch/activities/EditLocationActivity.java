package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.LocationEditFragment;
import com.myjobpitch.tasks.CreateUpdateLocationTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadLocationTask;

import java.io.IOException;

public class EditLocationActivity extends MJPActionBarActivity implements LocationEditFragment.LocationEditHost {

    private LocationEditFragment mLocationEditFragment;
    private View mEditLocationView;
    private Integer business_id;
    private Location location;
    private View mProgressView;
    private ReadLocationTask mReadLocationTask;
    private CreateUpdateLocationTask mCreateUpdateLocationTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_location);

        mEditLocationView = (View) findViewById(R.id.location_edit);
        mLocationEditFragment = (LocationEditFragment) getFragmentManager().findFragmentById(R.id.location_edit_fragment);
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        if (getIntent().hasExtra("location_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                location = mapper.readValue(getIntent().getStringExtra("location_data"), Location.class);
                mLocationEditFragment.load(location);
                showProgress(false);
            } catch (IOException e) {}
        } else if (getIntent().hasExtra("location_id")) {
            mReadLocationTask = new ReadLocationTask(getApi(), getIntent().getIntExtra("location_id", -1));
            mReadLocationTask.addListener(new ReadAPITask.Listener<Location>() {
                @Override
                public void onSuccess(Location result) {
                    location = result;
                    mLocationEditFragment.load(location);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    finish();
                    Toast toast = Toast.makeText(EditLocationActivity.this, "Error loading location", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadLocationTask.execute();
        } else {
            business_id = getIntent().getIntExtra("business_id", -1);
            showProgress(false);
            setTitle(R.string.action_add_location);
            location = new Location();
            location.setBusiness(business_id);
            mLocationEditFragment.load(location);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
    }

    private void attemptSave() {
        if (mLocationEditFragment.validateInput()) {
            showProgress(true);

            if (location == null) {
                location = new Location();
                location.setBusiness(business_id);
            }
            mLocationEditFragment.save(location);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateLocationTask = new CreateUpdateLocationTask(api, location);
            mCreateUpdateLocationTask.addListener(new CreateUpdateLocationTask.Listener() {
                @Override
                public void onSuccess(Location location) {
                    EditLocationActivity.this.finish();
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
            mCreateUpdateLocationTask.execute();
        }
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR2) {
            int shortAnimTime = getResources().getInteger(android.R.integer.config_shortAnimTime);

            mEditLocationView.setVisibility(show ? View.GONE : View.VISIBLE);
            mEditLocationView.animate().setDuration(shortAnimTime).alpha(
                    show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mEditLocationView.setVisibility(show ? View.GONE : View.VISIBLE);
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
            mEditLocationView.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
}
