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
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.recruiter.DeleteUserBusinessTask;
import com.myjobpitch.tasks.recruiter.ReadUserBusinessesTask;

import java.util.List;

public class BusinessListActivity extends MJPProgressActionBarActivity  {

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
            mode.setTitle(R.string.business);
            Business business = (Business) list.getItemAtPosition(list.getCheckedItemPosition());
            mode.setSubtitle(business.getName());
            return false;
        }

        @Override
        public boolean onActionItemClicked(ActionMode mode, MenuItem item) {
            final Business business = (Business) list.getItemAtPosition(list.getCheckedItemPosition());
            switch (item.getItemId()) {
                case R.id.action_edit:
                    Intent intent = new Intent(BusinessListActivity.this, EditBusinessActivity.class);
                    intent.putExtra("business_id", business.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(BusinessListActivity.this);
                    builder.setMessage("Are you sure you want to delete " + business.getName() + "?")
                            .setCancelable(false)
                            .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    showProgress(true);
                                    DeleteUserBusinessTask deleteBusinessTask = new DeleteUserBusinessTask(getApi(), business.getId());
                                    deleteBusinessTask.addListener(new DeleteAPITaskListener() {
                                        @Override
                                        public void onSuccess() {
                                            loadBusinesses();
                                        }

                                        @Override
                                        public void onError(JsonNode errors) {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(BusinessListActivity.this, "Error deleting business", Toast.LENGTH_LONG);
                                            toast.show();
                                        }

                                        @Override
                                        public void onCancelled() {}
                                    });
                                    deleteBusinessTask.execute();
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
            ((BusinessListAdapter)list.getAdapter()).notifyDataSetChanged();
            mActionMode = null;
        }
    };

    class BusinessListAdapter extends ArrayAdapter<Business> {
        public BusinessListAdapter(List<Business> list) {
            super(BusinessListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            Business business = this.getItem(position);

            LayoutInflater inflater = (LayoutInflater) BusinessListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            titleView.setText(business.getName());
            int locationCount = business.getLocations().size();
            if (locationCount == 1)
                subtitleView.setText("Includes " + locationCount + " location");
            else
                subtitleView.setText("Includes " + locationCount + " locations");
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_business_list);
        list = (ListView) findViewById(R.id.business_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Intent intent = new Intent(BusinessListActivity.this, LocationListActivity.class);
            intent.putExtra("business_id", ((Business)list.getItemAtPosition(position)).getId());
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
        loadBusinesses();
        Log.d("RecruiterActivity", "resumed");
    }

    private void loadBusinesses() {
        showProgress(true);
        ReadUserBusinessesTask readBusinesses = new ReadUserBusinessesTask(getApi());
        readBusinesses.addListener(new CreateReadUpdateAPITaskListener<List<Business>>() {
            @Override
            public void onSuccess(List<Business> result) {
                Log.d("BusinessListActivity", "success");
                list.setAdapter(new BusinessListAdapter(result));
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(BusinessListActivity.this, "Error loading companies", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        readBusinesses.execute();
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.business_list);
    }

    @Override
    public void onBackPressed() {
        Log.d("RecruiterActivity", "back");
        super.onBackPressed();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.business_list, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_add:
                Intent intent = new Intent(this, EditBusinessActivity.class);
                startActivity(intent);
                return true;
            case R.id.action_messages:
                // TODO open messages
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
