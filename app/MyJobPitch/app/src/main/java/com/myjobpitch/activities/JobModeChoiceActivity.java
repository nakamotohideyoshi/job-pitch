package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.text.Html;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.recruiter.DeleteUserJobTask;

public class JobModeChoiceActivity extends MJPProgressActionBarActivity  {

    public static final String JOB_ID = "JOB_ID";
    public static final String LOCATION_ID = "LOCATION_ID";
    public static final String TOKENS = "TOKENS";

    private Integer job_id;
    private Integer location_id;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_job_mode_choice);
        job_id = getIntent().getIntExtra(JOB_ID, -1);
        location_id = getIntent().getIntExtra(LOCATION_ID, -1);
        Integer tokens = getIntent().getIntExtra(TOKENS, 0);
        if (savedInstanceState != null) {
            job_id = savedInstanceState.getInt(JOB_ID, -1);
            location_id = savedInstanceState.getInt(LOCATION_ID, -1);
            tokens = savedInstanceState.getInt(TOKENS, 0);
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

        Button myshortlistButton = (Button)findViewById(R.id.myshortlist_button);
        myshortlistButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.myshortlist).toString().toUpperCase(), getText(R.string.myshortlist_description))));
        myshortlistButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(JobModeChoiceActivity.this, JobActivity.class);
                intent.putExtra(JobActivity.JOB_ID, job_id);
                intent.putExtra(JobActivity.MODE, JobActivity.MYSHORTLIST);
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

        findViewById(R.id.editjob_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(JobModeChoiceActivity.this, EditJobActivity.class);
                intent.putExtra("job_id", job_id);
                startActivityForResult(intent, 1);
            }
        });

        findViewById(R.id.removejob_button).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                AlertDialog.Builder builder = new AlertDialog.Builder(JobModeChoiceActivity.this);
                builder.setMessage(getString(R.string.delete_confirmation, job_id))
                        .setCancelable(false)
                        .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                                showProgress(true);
                                DeleteUserJobTask deleteJobTask = new DeleteUserJobTask(getApi(), job_id);
                                deleteJobTask.addListener(new DeleteAPITaskListener() {
                                    @Override
                                    public void onSuccess() {
                                        finish();
                                    }

                                    @Override
                                    public void onError(JsonNode errors) {
                                        showProgress(false);
                                        Toast toast = Toast.makeText(JobModeChoiceActivity.this, "Error deleting job", Toast.LENGTH_LONG);
                                        toast.show();
                                    }

                                    @Override
                                    public void onConnectionError() {
                                        showProgress(false);
                                        Toast toast = Toast.makeText(JobModeChoiceActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                                        toast.show();
                                    }

                                    @Override
                                    public void onCancelled() {}
                                });
                                deleteJobTask.execute();
                            }
                        })
                        .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                            }
                        }).create().show();
            }
        });

        ((TextView)findViewById(R.id.tokensLabel)).setText(tokens + " Credit");

        showProgress(false);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == 1) {
            if (data != null && !data.getBooleanExtra("active", true)) {
                finish();
            }
        }
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
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt(JOB_ID, job_id);
        outState.putInt(LOCATION_ID, location_id);
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.mode_choice);
    }
}
