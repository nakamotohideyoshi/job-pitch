package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.ActionMode;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.DeleteAPITask;
import com.myjobpitch.tasks.DeleteJobTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadJobsTask;
import com.myjobpitch.tasks.ReadLocationTask;

import java.util.List;

public class JobListActivity extends MJPProgressActionBarActivity  {

    private Integer location_id;
    private Location location;

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
            Job job = (Job) list.getItemAtPosition(list.getCheckedItemPosition());
            mode.setSubtitle(job.getTitle());
            return false;
        }

        @Override
        public boolean onActionItemClicked(ActionMode mode, MenuItem item) {
            final Job job = (Job) list.getItemAtPosition(list.getCheckedItemPosition());
            switch (item.getItemId()) {
                case R.id.action_edit:
                    Intent intent = new Intent(JobListActivity.this, EditJobActivity.class);
                    intent.putExtra("job_id", job.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(JobListActivity.this);
                    builder.setMessage("Are you sure you want to delete " + job.getTitle() + "?")
                            .setCancelable(false)
                            .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    showProgress(true);
                                    DeleteJobTask deleteJobTask = new DeleteJobTask(getApi(), job.getId());
                                    deleteJobTask.addListener(new DeleteAPITask.Listener() {
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
                                        public void onCancelled() {}
                                    });
                                    deleteJobTask.execute();
                                }
                            })
                            .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
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

    class JobListAdapter extends ArrayAdapter<Job> {
        public JobListAdapter(List<Job> list) {
            super(JobListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Job job = this.getItem(position);

            LayoutInflater inflater = (LayoutInflater) JobListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            titleView.setText(job.getTitle());
            subtitleView.setText(job.getDescription());
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_list);
        location_id = getIntent().getIntExtra("location_id", -1);
        list = (ListView) findViewById(R.id.job_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(JobListActivity.this, JobActivity.class);
                intent.putExtra("job_id", ((Job)list.getItemAtPosition(position)).getId());
                startActivity(intent);
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
        Log.d("RecruiterActivity", "created");
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobs();
        Log.d("RecruiterActivity", "resumed");
    }

    private void loadJobs() {
        showProgress(true);
        ReadLocationTask readLocation = new ReadLocationTask(getApi(), location_id);
        readLocation.addListener(new ReadAPITask.Listener<Location>() {
            @Override
            public void onSuccess(Location result) {
                location = result;
                getSupportActionBar()
                        .setSubtitle(location.getName());
                ReadJobsTask readJobs = new ReadJobsTask(getApi(), location_id);
                readJobs.addListener(new ReadAPITask.Listener<List<Job>>() {
                    @Override
                    public void onSuccess(List<Job> result) {
                        Log.d("LocationListActivity", "success");
                        list.setAdapter(new JobListAdapter(result));
                        showProgress(false);
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        Toast toast = Toast.makeText(JobListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }

                    @Override
                    public void onCancelled() {
                    }
                });
                readJobs.execute();
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        readLocation.execute();
    }

    @Override
    protected View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    protected View getMainView() {
        return findViewById(R.id.job_list);
    }

    @Override
    public void onBackPressed() {
        Log.d("RecruiterActivity", "back");
        super.onBackPressed();
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
                intent = new Intent(this, EditJobActivity.class);
                intent.putExtra("location_id", location_id);
                startActivity(intent);
                return true;
            case R.id.action_add_business:
                intent = new Intent(this, EditBusinessActivity.class);
                startActivity(intent);
                return true;
            case R.id.action_add_location:
                intent = new Intent(this, EditLocationActivity.class);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
