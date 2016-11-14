package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.view.ActionMode;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
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
                    intent.putExtra(EditBusinessActivity.BUSINESS_ID, business.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(BusinessListActivity.this);
                    builder.setMessage(getString(R.string.delete_confirmation, business.getName()))
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
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
                                        public void onConnectionError() {
                                            showProgress(false);
                                            Toast toast = Toast.makeText(BusinessListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                                            toast.show();
                                        }

                                        @Override
                                        public void onCancelled() {}
                                    });
                                    deleteBusinessTask.execute();
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
            ((BusinessListAdapter)list.getAdapter()).notifyDataSetChanged();
            mActionMode = null;
        }
    };

    class BusinessListAdapter extends CachingArrayAdapter<Business> {
        public BusinessListAdapter(List<Business> list) {
            super(BusinessListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Business business) {
            LayoutInflater inflater = (LayoutInflater) BusinessListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            List<Image> images = business.getImages();
            ProgressBar progress = (ProgressBar) rowView.findViewById(R.id.progress);
            if (images != null && !images.isEmpty()) {
                Uri uri = Uri.parse(images.get(0).getThumbnail());
                new DownloadImageTask(BusinessListActivity.this, imageView, progress).executeOnExecutor(DownloadImageTask.executor, uri);
            } else {
                progress.setVisibility(View.GONE);
                imageView.setImageResource(R.drawable.default_logo);
            }
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            titleView.setText(business.getName());
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            TextView tokensLabel = (TextView) rowView.findViewById(R.id.tokensLabel);
            int locationCount = business.getLocations().size();
            if (locationCount == 1)
                subtitleView.setText("Includes " + locationCount + " location");
            else
                subtitleView.setText("Includes " + locationCount + " locations");
            tokensLabel.setText(business.getTokens() + " Credit");
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
            intent.putExtra(LocationListActivity.BUSINESS_ID, ((Business)list.getItemAtPosition(position)).getId());
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
            public void onConnectionError() {
                Toast toast = Toast.makeText(BusinessListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.business_list, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_add:
                startActivity(new Intent(this, EditBusinessActivity.class));
                return true;
            case R.id.action_messages:
                startActivity(new Intent(this, ConversationListActivity.class));
                return true;
            case R.id.action_change_password:
                startActivity(new Intent(this, ChangePasswordActivity.class));
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
