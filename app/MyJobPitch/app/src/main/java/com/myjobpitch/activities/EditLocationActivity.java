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
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.LocationEditFragment;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.ReadLocationTask;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;
import com.myjobpitch.tasks.recruiter.DeleteLocationImageTask;

import java.io.IOException;

public class EditLocationActivity extends MJPProgressActionBarActivity {

    public static final String LOCATION_ID = "LOCATION_ID";
    public static final String BUSINESS_ID = "business_id";
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
        } else if (getIntent().hasExtra(LOCATION_ID)) {
            mReadLocationTask = new ReadLocationTask(getApi(), getIntent().getIntExtra(LOCATION_ID, -1));
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
            location.setBusiness(getIntent().getIntExtra(BUSINESS_ID, -1));
            //mLocationEditFragment.load(location);
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
                    final Uri imageUri = mLocationEditFragment.getImageUri();
                    Uri originalUri = null;
                    Image originalImage = null;
                    if (location.getImages() != null && !location.getImages().isEmpty()) {
                        originalImage = location.getImages().get(0);
                        originalUri = Uri.parse(originalImage.getThumbnail());
                    }
                    if ((imageUri == null && originalUri == null) || (imageUri != null && imageUri.equals(originalUri))) {
                        // No change to image
                        EditLocationActivity.this.finish();
                    } else if (imageUri == null) {
                        // Image deleted
                        DeleteLocationImageTask deleteTask = new DeleteLocationImageTask(getApi(), originalImage.getId());
                        deleteTask.addListener(new DeleteAPITaskListener() {
                            @Override
                            public void onSuccess() {
                                EditLocationActivity.this.finish();
                            }

                            @Override
                            public void onError(JsonNode errors) {
                                showProgress(false);
                                Toast toast = Toast.makeText(EditLocationActivity.this, "Error deleting image", Toast.LENGTH_LONG);
                                toast.show();
                                EditLocationActivity.this.finish();
                            }

                            @Override
                            public void onConnectionError() {
                                showProgress(false);
                                Toast toast = Toast.makeText(EditLocationActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                                toast.show();
                            }

                            @Override
                            public void onCancelled() {}
                        });
                        deleteTask.execute();
                    } else {
                        // Image changed
                        UploadImageTask uploadTask = new UploadImageTask(EditLocationActivity.this, getApi(), "user-location-images", "location", imageUri, location);
                        uploadTask.addListener(new APITaskListener<Boolean>() {
                            @Override
                            public void onPostExecute(Boolean success) {
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
        intent.putExtra(LOCATION_ID, location.getId());
        startActivity(intent);
        EditLocationActivity.this.finish();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
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
