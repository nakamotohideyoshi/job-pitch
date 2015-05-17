package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
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
    private View mMessageBoxView;
    private TextView mMessageBoxMessageView;
    private Button mSetupButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_seeker);

        mJobSeekerView = findViewById(R.id.job_seeker_main);
        mProgressView = findViewById(R.id.progress);
        mMessageBoxView = findViewById(R.id.message_box);
        mMessageBoxMessageView = (TextView) findViewById(R.id.message_box_message);
        mSetupButton = (Button) findViewById(R.id.setup_button);
        mSetupButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                editProfile();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobSeeker();
    }

    private void loadJobSeeker() {
        showProgress(true);
        ReadUserJobSeekerTask readJobSeekerTask = new ReadUserJobSeekerTask(getApi());
        readJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
            @Override
            public void onSuccess(JobSeeker result) {
                jobSeeker = result;
                if (jobSeeker.getProfile() == null) {
                    mMessageBoxView.setVisibility(View.VISIBLE);
                    mMessageBoxMessageView.setText(getString(R.string.setup_profile_message));
                } else {
                    mMessageBoxView.setVisibility(View.INVISIBLE);
                }
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
        switch (item.getItemId()) {
            case R.id.action_edit_profile:
                startActivity(new Intent(this, EditJobSeekerActivity.class));
                return true;
            case R.id.action_edit_job_profile:
                editProfile();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void editProfile() {
        Intent intent;
        intent = new Intent(this, EditJobProfileActivity.class);
        intent.putExtra("job_seeker_id", getApi().getUser().getJob_seeker());
        startActivity(intent);
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
