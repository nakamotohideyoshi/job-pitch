package com.myjobpitch.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
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
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.fragments.JobEditFragment;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.CreateUpdateJobTask;
import com.myjobpitch.tasks.recruiter.DeleteJobImageTask;
import com.myjobpitch.tasks.recruiter.ReadUserJobTask;

import java.io.IOException;

public class EditJobActivity extends MJPProgressActionBarActivity {

    private static final String LOCATION_ID = "LOCATION_ID";
    private JobEditFragment mJobEditFragment;
    private View mEditJobView;
    private Job job;
    private View mProgressView;
    private ReadUserJobTask mReadJobTask;
    private CreateUpdateJobTask mCreateUpdateJobTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job);

        mEditJobView = (View) findViewById(R.id.job_edit);
        mJobEditFragment = (JobEditFragment) getSupportFragmentManager().findFragmentById(R.id.job_edit_fragment);
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        mJobEditFragment.loadApplicationData(getMJPApplication());

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String job_data = savedInstanceState.getString("job_data");
                Log.d("EditJobActivity", String.format("savedIntanceState['job_data']: %s", job_data));
                job = mapper.readValue(job_data, Job.class);
                mJobEditFragment.load(job);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditJobActivity", "Error", e);
            }
        } else if (getIntent().hasExtra("job_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                job = mapper.readValue(getIntent().getStringExtra("job_data"), Job.class);
                mJobEditFragment.load(job);
                showProgress(false);
            } catch (IOException e) {}
        } else if (getIntent().hasExtra("job_id")) {
            mReadJobTask = new ReadUserJobTask(getApi(), getIntent().getIntExtra("job_id", -1));
            mReadJobTask.addListener(new CreateReadUpdateAPITaskListener<Job>() {
                @Override
                public void onSuccess(Job result) {
                    job = result;
                    mJobEditFragment.load(job);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    Toast toast = Toast.makeText(EditJobActivity.this, "Error loading job", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onConnectionError() {
                    Toast toast = Toast.makeText(EditJobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobTask.execute();
        } else {
            setTitle(R.string.action_add_job);
            job = new Job();
            job.setLocation(getIntent().getIntExtra(EditJobActivity.LOCATION_ID, -1));
            job.setStatus(getMJPApplication().get(JobStatus.class, "OPEN").getId());
            mJobEditFragment.load(job);
            showProgress(false);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mJobEditFragment.save(job);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("job_data", mapper.writeValueAsString(job));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {

        if (mJobEditFragment.validateInput()) {
            showProgress(true);
            mJobEditFragment.save(job);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobTask = new CreateUpdateJobTask(api, job);
            mCreateUpdateJobTask.addListener(new CreateReadUpdateAPITaskListener<Job>() {
                @Override
                public void onSuccess(Job job) {
                    final Uri imageUri = mJobEditFragment.getImageUri();
                    Uri originalUri = null;
                    Image originalImage = null;
                    if (job.getImages() != null && !job.getImages().isEmpty()) {
                        originalImage = job.getImages().get(0);
                        originalUri = Uri.parse(originalImage.getThumbnail());
                    }
                    if ((imageUri == null && originalUri == null) || (imageUri != null && imageUri.equals(originalUri))) {
                        // No change to image
                        saveFinish();
                    } else if (imageUri == null) {
                        // Image deleted
                        DeleteJobImageTask deleteTask = new DeleteJobImageTask(getApi(), originalImage.getId());
                        deleteTask.addListener(new DeleteAPITaskListener() {
                            @Override
                            public void onSuccess() {
                                saveFinish();
                            }

                            @Override
                            public void onError(JsonNode errors) {
                                showProgress(false);
                                Toast toast = Toast.makeText(EditJobActivity.this, "Error deleting image", Toast.LENGTH_LONG);
                                toast.show();
                                saveFinish();
                            }

                            @Override
                            public void onConnectionError() {
                                showProgress(false);
                                Toast toast = Toast.makeText(EditJobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                                toast.show();
                            }

                            @Override
                            public void onCancelled() {}
                        });
                        deleteTask.execute();
                    } else {
                        // Image changed
                        UploadImageTask uploadTask = new UploadImageTask(EditJobActivity.this, getApi(), "user-job-images", "job", imageUri, job);
                        uploadTask.addListener(new APITaskListener<Boolean>() {
                            @Override
                            public void onPostExecute(Boolean success) {
                                saveFinish();
                            }

                            @Override
                            public void onCancelled() {
                                saveFinish();
                                Toast toast = Toast.makeText(EditJobActivity.this, "Error uploading job image", Toast.LENGTH_LONG);
                                toast.show();
                            }
                        });
                        uploadTask.execute();
                    }
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditJobActivity.this, "Error updating job details", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditJobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateJobTask.execute();
        }
    }

    public void saveFinish() {
        Intent intent = getIntent();
        JobStatus mStatusOpen = getMJPApplication().get(JobStatus.class, "OPEN");
        intent.putExtra("active", job.getStatus().equals(mStatusOpen.getId()));
        setResult(RESULT_OK, intent);
        EditJobActivity.this.finish();
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
        return mEditJobView;
    }
}
