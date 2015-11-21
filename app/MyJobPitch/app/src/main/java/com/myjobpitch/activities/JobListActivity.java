package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
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

public class JobListActivity extends MJPProgressActionBarActivity  {

    public static final String LOCATION_ID = "LOCATION_ID";
            ;
    private Integer mStatusOpenId;

    private Integer location_id;
    private Location mLocation;

    private ListView list;

    private ActionMode mActionMode;
    private ActionMode.Callback mActionModeCallback = new ActionMode.Callback() {

        @Override
        public boolean onCreateActionMode(ActionMode mode, Menu menu) {
            MenuInflater inflater = mode.getMenuInflater();
            inflater.inflate(R.menu.list_context, menu);
            return true;
        }

        @Override
        public boolean onPrepareActionMode(ActionMode mode, Menu menu) {
            mode.setTitle(R.string.job);
            Job job = getSelectedJob();
            mode.setSubtitle(job.getTitle());
            return false;
        }

        private Job getSelectedJob() {
            return (Job) list.getItemAtPosition(list.getCheckedItemPosition());
        }

        @Override
        public boolean onActionItemClicked(ActionMode mode, MenuItem item) {
            final Job job = getSelectedJob();
            switch (item.getItemId()) {
                case R.id.action_edit:
                    Intent intent = new Intent(JobListActivity.this, EditJobActivity.class);
                    intent.putExtra("job_id", job.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(JobListActivity.this);
                    builder.setMessage(getString(R.string.delete_confirmation, job.getTitle()))
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    showProgress(true);
                                    DeleteUserJobTask deleteJobTask = new DeleteUserJobTask(getApi(), job.getId());
                                    deleteJobTask.addListener(new DeleteAPITaskListener() {
                                        @Override
                                        public void onSuccess() {
                                            loadJobs();
                                        }

                                        @Override
                                        public void onError(JsonNode errors) {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(JobListActivity.this, "Error deleting job", Toast.LENGTH_LONG);
                                            toast.show();
                                        }

                                        @Override
                                        public void onConnectionError() {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(JobListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
                    mode.finish();
                    return true;
                default:
                    return false;
            }
        }

        @Override
        public void onDestroyActionMode(ActionMode mode) {
            list.clearChoices();
            ((JobListAdapter)list.getAdapter()).notifyDataSetChanged();
            mActionMode = null;
        }
    };
    private Job job;

    class JobListAdapter extends CachingArrayAdapter<Job> {
        public JobListAdapter(List<Job> list) {
            super(JobListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Job job) {
            LayoutInflater inflater = (LayoutInflater) JobListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            Image image = null;
            ProgressBar progress = (ProgressBar) rowView.findViewById(R.id.progress);
            TextView noImageView = (TextView) rowView.findViewById(R.id.no_image);
            if (job.getImages() != null && !job.getImages().isEmpty())
                image = job.getImages().get(0);
            else if (job.getLocation_data().getImages() != null && !job.getLocation_data().getImages().isEmpty())
                image = job.getLocation_data().getImages().get(0);
            else if (job.getLocation_data().getBusiness_data().getImages() != null && !job.getLocation_data().getBusiness_data().getImages().isEmpty())
                image = job.getLocation_data().getBusiness_data().getImages().get(0);
            if (image != null) {
                Uri uri = Uri.parse(image.getThumbnail());
                new DownloadImageTask(JobListActivity.this, imageView, progress).execute(uri);
            } else {
                progress.setVisibility(View.GONE);
                noImageView.setVisibility(View.VISIBLE);
            }
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            titleView.setText(job.getTitle());
            if (job.getStatus().equals(mStatusOpenId)) {
                subtitleView.setText(job.getDescription());
            } else {
                rowView.setAlpha(0.4f);
                titleView.setTypeface(null, Typeface.ITALIC);
                subtitleView.setTypeface(null, Typeface.ITALIC);
                subtitleView.setText(String.format("(%s) %s", getString(R.string.inactive), job.getDescription()));
            }
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mStatusOpenId = getMJPApplication().get(JobStatus.class, "OPEN").getId();

        setContentView(R.layout.activity_job_list);
        location_id = getIntent().getIntExtra(LOCATION_ID, -1);


        list = (ListView) findViewById(R.id.job_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                job = (Job) list.getItemAtPosition(position);
                if (job.getStatus().equals(mStatusOpenId)) {
                    Intent intent = new Intent(JobListActivity.this, JobModeChoiceActivity.class);
                    intent.putExtra(JobModeChoiceActivity.JOB_ID, job.getId());
                    intent.putExtra(JobModeChoiceActivity.LOCATION_ID, job.getLocation());
                    startActivity(intent);
                } else {
                    new AlertDialog.Builder(JobListActivity.this)
                            .setMessage(getString(R.string.cant_view_inactive_job))
                            .setCancelable(false)
                            .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                                @Override
                                public void onClick(DialogInterface dialog, int which) {
                                    dialog.cancel();
                                }
                            })
                            .show();
                }
            }
        });
        list.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
            public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
                if (mActionMode != null)
                    return false;

                // Start the CAB using the ActionMode.Callback defined above
                list.setItemChecked(position, true);
                mActionMode = startActionMode(mActionModeCallback);
                return true;
            }
        });
        list.setEmptyView(findViewById(android.R.id.empty));
        Button addJobButton = (Button) findViewById(R.id.add_job_button);
        addJobButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addJob();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobs();
    }

    private void loadJobs() {
        showProgress(true);
        final AtomicInteger completeTasks = new AtomicInteger();
        ExecutorService executor = Executors.newFixedThreadPool(2);

        ReadLocationTask readLocation = new ReadLocationTask(getApi(), location_id);
        readLocation.addListener(new CreateReadUpdateAPITaskListener<Location>() {
            @Override
            public void onSuccess(Location result) {
                mLocation = result;
                getSupportActionBar().setTitle(mLocation.getName());
                getSupportActionBar().setSubtitle(getString(R.string.jobs));
                if (completeTasks.incrementAndGet() == 2)
                    showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(JobListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        readLocation.executeOnExecutor(executor);

        ReadUserJobsTask readJobs = new ReadUserJobsTask(getApi(), location_id);
        readJobs.addListener(new CreateReadUpdateAPITaskListener<List<Job>>() {
            @Override
            public void onSuccess(List<Job> result) {
                list.setAdapter(new JobListAdapter(result));
                if (completeTasks.incrementAndGet() == 2)
                    showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(JobListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        readJobs.executeOnExecutor(executor);
        executor.shutdown();
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.job_list_main);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.job_list, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case R.id.action_add:
                addJob();
                return true;
            case R.id.action_add_business:
                intent = new Intent(this, EditBusinessActivity.class);
                startActivity(intent);
                return true;
            case R.id.action_add_location:
                intent = new Intent(this, EditLocationActivity.class);
                startActivity(intent);
                return true;
            case android.R.id.home:
                finish();
                if (mLocation != null) {
                    intent = NavUtils.getParentActivityIntent(JobListActivity.this);
                    intent.putExtra("business_id", mLocation.getBusiness());
                    startActivity(intent);
                }
                return true;
            case R.id.action_messages:
                startActivity(new Intent(JobListActivity.this, ConversationListActivity.class));
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void addJob() {
        Intent intent;
        intent = new Intent(this, EditJobActivity.class);
        intent.putExtra(LOCATION_ID, location_id);
        startActivity(intent);
    }
}
