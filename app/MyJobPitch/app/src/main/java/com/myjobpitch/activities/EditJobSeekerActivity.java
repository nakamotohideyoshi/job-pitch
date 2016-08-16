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
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.fragments.JobSeekerEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobSeekerTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;

import java.io.IOException;

public class EditJobSeekerActivity extends MJPProgressActionBarActivity {

    private JobSeekerEditFragment mJobSeekerEditFragment;
    private View mEditJobSeekerView;
    private JobSeeker mJobSeeker;
    private View mProgressView;
    private ReadJobSeekerTask mReadJobSeekerTask;
    private CreateUpdateJobSeekerTask mCreateUpdateJobSeekerTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_job_seeker);

        mEditJobSeekerView = (View) findViewById(R.id.job_seeker_edit);
        mJobSeekerEditFragment = (JobSeekerEditFragment) getSupportFragmentManager().findFragmentById(R.id.job_seeker_edit_fragment);
        mJobSeekerEditFragment.loadApplicationData(getMJPApplication());
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        mJobSeekerEditFragment.mSaveButton = saveButton;

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String job_seeker_data = savedInstanceState.getString("job_seeker_data");
                Log.d("EditJobSeekerActivity", String.format("savedIntanceState['job_seeker_data']: %s", job_seeker_data));
                mJobSeeker = mapper.readValue(job_seeker_data, JobSeeker.class);
                mJobSeekerEditFragment.load(mJobSeeker);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditJobSeekerActivity", "Error", e);
            }
        } else {
            mReadJobSeekerTask = new ReadJobSeekerTask(getApi(), getApi().getUser().getJob_seeker());
            mReadJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker result) {
                    mJobSeeker = result;
                    mJobSeekerEditFragment.load(mJobSeeker);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    Toast toast = Toast.makeText(EditJobSeekerActivity.this, "Error loading job seeker", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onConnectionError() {
                    Toast toast = Toast.makeText(EditJobSeekerActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                    finish();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadJobSeekerTask.execute();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mJobSeekerEditFragment.save(mJobSeeker);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("job_seeker_data", mapper.writeValueAsString(mJobSeeker));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {
        if (mJobSeekerEditFragment.validateInput()) {
            showProgress(true);

            mJobSeekerEditFragment.save(mJobSeeker);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateJobSeekerTask = new CreateUpdateJobSeekerTask(api, mJobSeeker);
            mCreateUpdateJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
                @Override
                public void onSuccess(JobSeeker jobSeeker) {
                    EditJobSeekerActivity.this.finish();
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                }

                @Override
                public void onConnectionError() {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditJobSeekerActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateJobSeekerTask.execute();
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(EditJobSeekerActivity.this);
                startActivity(intent);
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
        return mEditJobSeekerView;
    }


    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == RESULT_OK) {
            Uri uri = data.getData();
            String src = uri.getPath();
            String[] tempStr = src.split("/");
            mJobSeekerEditFragment.cvFileName.setText(tempStr[tempStr.length-1]);
        }

    }
}
