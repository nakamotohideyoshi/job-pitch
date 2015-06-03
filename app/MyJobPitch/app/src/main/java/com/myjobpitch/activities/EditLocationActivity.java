package com.myjobpitch.activities;

import android.content.Intent;
import android.net.Uri;
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
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.LocationEditFragment;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadLocationTask;
import com.myjobpitch.tasks.UploadImage;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.io.IOException;

public class EditLocationActivity extends MJPProgressActionBarActivity {

    private LocationEditFragment mLocationEditFragment;
    private View mEditLocationView;
    private Location location;
    private View mProgressView;
    private ReadLocationTask mReadLocationTask;
    private CreateUpdateLocationTask mCreateUpdateLocationTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_location);

        mEditLocationView = (View) findViewById(R.id.location_edit);
        mLocationEditFragment = (LocationEditFragment) getSupportFragmentManager().findFragmentById(R.id.location_edit_fragment);
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
                String location_data = savedInstanceState.getString("location_data");
                Log.d("EditLocationActivity", String.format("savedIntanceState['location_data']: %s", location_data));
                location = mapper.readValue(location_data, Location.class);
                mLocationEditFragment.load(location);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditLocationActivity", "Error", e);
            }
        } else if (getIntent().hasExtra("location_data")) {
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
                    Toast toast = Toast.makeText(EditLocationActivity.this, "Error loading location", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onConnectionError() {
                    Toast toast = Toast.makeText(EditLocationActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadLocationTask.execute();
        } else {
            showProgress(false);
            setTitle(R.string.action_add_location);
            location = new Location();
            location.setBusiness(getIntent().getIntExtra("business_id", -1));
            mLocationEditFragment.load(location);
        }
    }
    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mLocationEditFragment.save(location);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("location_data", mapper.writeValueAsString(location));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {
        if (mLocationEditFragment.validateInput()) {
            showProgress(true);

            mLocationEditFragment.save(location);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateLocationTask = new CreateUpdateLocationTask(api, location);
            mCreateUpdateLocationTask.addListener(new CreateReadUpdateAPITaskListener<Location>() {
                @Override
                public void onSuccess(final Location location) {
                    final Uri imageUri = mLocationEditFragment.getNewImageUri();
                    if (imageUri == null) {
                        returnToListActivity(location);
                    } else {
                        UploadImage uploadTask = new UploadImage(EditLocationActivity.this, getApi(), "user-location-images", "location", imageUri, location);
                        uploadTask.addListener(new APITaskListener() {
                            @Override
                            public void onPostExecute() {
                                returnToListActivity(location);
                            }

                            @Override
                            public void onCancelled() {
                                returnToListActivity(location);
                                Toast toast = Toast.makeText(EditLocationActivity.this, "Error uploading location image", Toast.LENGTH_LONG);
                                toast.show();
                            }
                        });
                        uploadTask.execute();
                    }
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditLocationActivity.this, "Error updating work place details", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditLocationActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateLocationTask.execute();
        }
    }

    private void returnToListActivity(Location location) {
        Intent intent = new Intent(EditLocationActivity.this, JobListActivity.class);
        intent.putExtra("location_id", location.getId());
        startActivity(intent);
        EditLocationActivity.this.finish();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                intent = NavUtils.getParentActivityIntent(EditLocationActivity.this);
                intent.putExtra("business_id", location.getBusiness());
                startActivity(intent);
                finish();
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
        return mEditLocationView;
    }
}
