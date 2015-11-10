package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.text.Html;
import android.text.SpannableString;
import android.view.ActionMode;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadLocationTask;
import com.myjobpitch.tasks.recruiter.DeleteUserJobTask;
import com.myjobpitch.tasks.recruiter.ReadUserJobsTask;

import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

public class JobModeChoiceActivity extends MJPActionBarActivity  {

    public static final String JOB_ID = "JOB_ID";
    public static final String LOCATION_ID = "LOCATION_ID";

    private Integer job_id;
    private Integer location_id;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_job_mode_choice);
        job_id = getIntent().getIntExtra(JOB_ID, -1);
        location_id = getIntent().getIntExtra(LOCATION_ID, -1);
        if (savedInstanceState != null) {
            job_id = savedInstanceState.getInt(JOB_ID, -1);
            location_id = savedInstanceState.getInt(LOCATION_ID, -1);
        }

        Button searchButton = (Button)findViewById(R.id.search_button);
        searchButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.search).toString().toUpperCase(), getText(R.string.job_seeker_search_description))));
        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(JobModeChoiceActivity.this, JobActivity.class);
                intent.putExtra(JobActivity.JOB_ID, job_id);
                intent.putExtra(JobActivity.MODE, JobActivity.SEARCH);
                startActivity(intent);
            }
        });

        Button applicationsButton = (Button)findViewById(R.id.applications_button);
        applicationsButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.applications).toString().toUpperCase(), getText(R.string.applications_description))));
        applicationsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(JobModeChoiceActivity.this, JobActivity.class);
                intent.putExtra(JobActivity.JOB_ID, job_id);
                intent.putExtra(JobActivity.MODE, JobActivity.APPLICATIONS);
                startActivity(intent);
            }
        });

        Button connectionsButton = (Button)findViewById(R.id.connections_button);
        connectionsButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.connections).toString().toUpperCase(), getText(R.string.connections_description))));
        connectionsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(JobModeChoiceActivity.this, JobActivity.class);
                intent.putExtra(JobActivity.JOB_ID, job_id);
                intent.putExtra(JobActivity.MODE, JobActivity.CONNECTIONS);
                startActivity(intent);
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(JobModeChoiceActivity.this);
                intent.putExtra(JobListActivity.LOCATION_ID, location_id);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(JOB_ID, job_id);
        outState.putInt(LOCATION_ID, location_id);
    }
}
