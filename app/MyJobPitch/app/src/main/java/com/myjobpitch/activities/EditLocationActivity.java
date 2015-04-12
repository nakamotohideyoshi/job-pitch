package com.myjobpitch.activities;

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
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadLocationTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.io.IOException;

public class EditLocationActivity extends MJPProgressActionBarActivity {

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
            mReadLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
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
            mCreateUpdateLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
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

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mEditLocationView;
    }
}
