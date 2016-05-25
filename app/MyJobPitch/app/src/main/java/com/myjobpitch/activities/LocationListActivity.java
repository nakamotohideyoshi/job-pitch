package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.support.v7.view.ActionMode;
import android.util.Log;
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
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteUserLocationTask;
import com.myjobpitch.tasks.recruiter.ReadUserBusinessTask;
import com.myjobpitch.tasks.recruiter.ReadUserLocationsTask;

import java.util.List;

public class LocationListActivity extends MJPProgressActionBarActivity  {

    public static final String BUSINESS_ID = "business_id";
    private Integer business_id;
    private Business business;

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
            mode.setTitle(R.string.work_place);
            Location location = (Location) list.getItemAtPosition(list.getCheckedItemPosition());
            mode.setSubtitle(location.getName());
            return false;
        }

        @Override
        public boolean onActionItemClicked(ActionMode mode, MenuItem item) {
            final Location location = (Location) list.getItemAtPosition(list.getCheckedItemPosition());
            switch (item.getItemId()) {
                case R.id.action_edit:
                    Intent intent = new Intent(LocationListActivity.this, EditLocationActivity.class);
                    intent.putExtra(EditLocationActivity.LOCATION_ID, location.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(LocationListActivity.this);
                    builder.setMessage(getString(R.string.delete_confirmation, location.getName()))
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    showProgress(true);
                                    DeleteUserLocationTask deleteLocationTask = new DeleteUserLocationTask(getApi(), location.getId());
                                    deleteLocationTask.addListener(new DeleteAPITaskListener() {
                                        @Override
                                        public void onSuccess() {
                                            loadLocations();
                                        }

                                        @Override
                                        public void onError(JsonNode errors) {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(LocationListActivity.this, "Error deleting location", Toast.LENGTH_LONG);
                                            toast.show();
                                        }

                                        @Override
                                        public void onConnectionError() {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(LocationListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                                            toast.show();
                                        }

                                        @Override
                                        public void onCancelled() {
                                        }
                                    });
                                    deleteLocationTask.execute();
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
            ((LocationListAdapter)list.getAdapter()).notifyDataSetChanged();
            mActionMode = null;
        }
    };

    class LocationListAdapter extends CachingArrayAdapter<Location> {
        public LocationListAdapter(List<Location> list) {
            super(LocationListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Location location) {
            LayoutInflater inflater = (LayoutInflater) LocationListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            Image image = null;
            ProgressBar progress = (ProgressBar) rowView.findViewById(R.id.progress);
            TextView noImageView = (TextView) rowView.findViewById(R.id.no_image);
            if (location.getImages() != null && !location.getImages().isEmpty())
                image = location.getImages().get(0);
            else if (location.getBusiness_data().getImages() != null && !location.getBusiness_data().getImages().isEmpty())
                image = location.getBusiness_data().getImages().get(0);
            if (image != null) {
                Uri uri = Uri.parse(image.getThumbnail());
                new DownloadImageTask(LocationListActivity.this, imageView, progress).executeOnExecutor(DownloadImageTask.executor, uri);
            } else {
                progress.setVisibility(View.GONE);
                noImageView.setVisibility(View.VISIBLE);
            }
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            titleView.setText(location.getName());
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            Integer activeJobCount = location.getActive_job_count();
            if (activeJobCount == 1)
                subtitleView.setText("Includes " + activeJobCount + " active job");
            else
                subtitleView.setText("Includes " + activeJobCount + " active jobs");
                return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location_list);
        business_id = getIntent().getIntExtra(BUSINESS_ID, -1);
        list = (ListView) findViewById(R.id.location_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Intent intent = new Intent(LocationListActivity.this, JobListActivity.class);
                intent.putExtra(JobListActivity.LOCATION_ID, ((Location) list.getItemAtPosition(position)).getId());
                startActivity(intent);
            }
        });
        list.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
            public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
                if (mActionMode != null)
                    return false;

                // Start the CAB using the ActionMode.Callback defined above
                list.setItemChecked(position, true);
                mActionMode = startSupportActionMode(mActionModeCallback);
                return true;
            }
        });
        list.setEmptyView(findViewById(android.R.id.empty));
        Button addJobButton = (Button) findViewById(R.id.add_location_button);
        addJobButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                addLocation();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadLocations();
    }

    private void loadLocations() {
        showProgress(true);
        ReadUserBusinessTask readBusiness = new ReadUserBusinessTask(getApi(), business_id);
        readBusiness.addListener(new CreateReadUpdateAPITaskListener<Business>() {
            @Override
            public void onSuccess(Business result) {
                business = result;
                getSupportActionBar().setTitle(business.getName());
                getSupportActionBar().setSubtitle(getString(R.string.locations));
                ReadUserLocationsTask readLocations = new ReadUserLocationsTask(getApi(), business_id);
                readLocations.addListener(new CreateReadUpdateAPITaskListener<List<Location>>() {
                    @Override
                    public void onSuccess(List<Location> result) {
                        Log.d("LocationListActivity", "success");
                        list.setAdapter(new LocationListAdapter(result));
                        showProgress(false);
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        Toast toast = Toast.makeText(LocationListActivity.this, "Error loading work places", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }

                    @Override
                    public void onConnectionError() {
                        Toast toast = Toast.makeText(LocationListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }

                    @Override
                    public void onCancelled() {}
                });
                readLocations.execute();
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(LocationListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(LocationListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {}
        });
        readBusiness.execute();
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.location_list_main);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.location_list, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case R.id.action_add:
                addLocation();
                return true;
            case R.id.action_edit_business:
                intent = new Intent(this, EditBusinessActivity.class);
                intent.putExtra(EditBusinessActivity.BUSINESS_ID, business.getId());
                startActivity(intent);
                return true;
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(LocationListActivity.this);
                startActivity(intent);
                return true;
            case R.id.action_messages:
                startActivity(new Intent(LocationListActivity.this, ConversationListActivity.class));
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void addLocation() {
        Intent intent;
        intent = new Intent(this, EditLocationActivity.class);
        intent.putExtra(EditLocationActivity.BUSINESS_ID, business_id);
        startActivity(intent);
    }
}
