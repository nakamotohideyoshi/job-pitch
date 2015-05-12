package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.jobseeker.ReadUserJobSeekerTask;

public class JobSeekerActivity extends MJPProgressActionBarActivity {
    private View mProgressView;
    private View mJobSeekerView;
    private JobSeeker jobSeeker;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_seeker);

        mJobSeekerView = findViewById(R.id.job_seeker_main);
        mProgressView = findViewById(R.id.progress);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobSeeker();
        Log.d("JobSeekerActivity", "resumed");
    }

    private void loadJobSeeker() {
        showProgress(true);
        ReadUserJobSeekerTask readJobSeekerTask = new ReadUserJobSeekerTask(getApi());
        readJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
            @Override
            public void onSuccess(JobSeeker result) {
                jobSeeker = result;
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobSeekerActivity.this, "Error loading job seeker", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        readJobSeekerTask.execute();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.job_seeker, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case R.id.action_edit_profile:
                intent = new Intent(this, EditJobSeekerActivity.class);
                intent.putExtra("job_seeker_id", getApi().getUser().getJob_seeker());
                startActivity(intent);
                return true;
            case R.id.action_edit_job_profile:
                intent = new Intent(this, EditJobProfileActivity.class);
                intent.putExtra("job_seeker_id", getApi().getUser().getJob_seeker());
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public View getMainView() {
        return mJobSeekerView;
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }
}
