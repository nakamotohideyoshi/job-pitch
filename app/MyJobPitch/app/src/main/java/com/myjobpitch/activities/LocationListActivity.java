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
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.DeleteAPITask;
import com.myjobpitch.tasks.DeleteLocationTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadBusinessTask;
import com.myjobpitch.tasks.ReadLocationsTask;

import java.util.List;

public class LocationListActivity extends MJPProgressActionBarActivity  {

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
            mode.setTitle(R.string.location);
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
                    intent.putExtra("location_id", location.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(LocationListActivity.this);
                    builder.setMessage("Are you sure you want to delete " + location.getName() + "?")
                            .setCancelable(false)
                            .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    showProgress(true);
                                    DeleteLocationTask deleteLocationTask = new DeleteLocationTask(getApi(), location.getId());
                                    deleteLocationTask.addListener(new DeleteAPITask.Listener() {
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
                                        public void onCancelled() {}
                                    });
                                    deleteLocationTask.execute();
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
            ((LocationListAdapter)list.getAdapter()).notifyDataSetChanged();
            mActionMode = null;
        }
    };

    class LocationListAdapter extends ArrayAdapter<Location> {
        public LocationListAdapter(List<Location> list) {
            super(LocationListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Location location = this.getItem(position);

            LayoutInflater inflater = (LayoutInflater) LocationListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            titleView.setText(location.getName());
            int jobCount = location.getJobs().size();
            if (jobCount == 1)
                subtitleView.setText("Includes " + jobCount + " job");
            else
                subtitleView.setText("Includes " + jobCount + " jobs");
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_location_list);
        business_id = getIntent().getIntExtra("business_id", -1);
        list = (ListView) findViewById(R.id.location_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Intent intent = new Intent(LocationListActivity.this, JobListActivity.class);
            intent.putExtra("location_id", ((Location)list.getItemAtPosition(position)).getId());
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
        loadLocations();
        Log.d("RecruiterActivity", "resumed");
    }

    private void loadLocations() {
        showProgress(true);
        ReadBusinessTask readBusiness = new ReadBusinessTask(getApi(), business_id);
        readBusiness.addListener(new ReadAPITask.Listener<Business>() {
            @Override
            public void onSuccess(Business result) {
                business = result;
                getSupportActionBar()
                        .setSubtitle(business.getName());
                ReadLocationsTask readLocations = new ReadLocationsTask(getApi(), business_id);
                readLocations.addListener(new ReadAPITask.Listener<List<Location>>() {
                    @Override
                    public void onSuccess(List<Location> result) {
                        Log.d("LocationListActivity", "success");
                        list.setAdapter(new LocationListAdapter(result));
                        showProgress(false);
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        Toast toast = Toast.makeText(LocationListActivity.this, "Error loading locations", Toast.LENGTH_LONG);
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
            public void onCancelled() {}
        });
        readBusiness.execute();
    }

    @Override
    protected View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    protected View getMainView() {
        return findViewById(R.id.location_list);
    }

    @Override
    public void onBackPressed() {
        Log.d("RecruiterActivity", "back");
        super.onBackPressed();
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
                intent = new Intent(this, EditLocationActivity.class);
                intent.putExtra("business_id", business_id);
                startActivity(intent);
                return true;
            case R.id.action_add_business:
                intent = new Intent(this, EditBusinessActivity.class);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
