package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
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
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.recruiter.ReadApplicationsTask;

import java.util.List;

public class ConversationListActivity extends MJPProgressActionBarActivity  {

    private ListView list;

    /*private ActionMode mActionMode;
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
                    Intent intent = new Intent(ConversationListActivity.this, EditBusinessActivity.class);
                    intent.putExtra("business_id", business.getId());
                    startActivity(intent);
                    mode.finish();
                    return true;
                case R.id.action_delete:
                    AlertDialog.Builder builder = new AlertDialog.Builder(ConversationListActivity.this);
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
                                            Toast toast = Toast.makeText(ConversationListActivity.this, "Error deleting business", Toast.LENGTH_LONG);
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
    };*/

    class ConversationListAdapter extends CachingArrayAdapter<Application> {
        public ConversationListAdapter(List<Application> list) {
            super(ConversationListActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Application application) {
            LayoutInflater inflater = (LayoutInflater) ConversationListActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.conversation_list_item, parent, false);

            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            ProgressBar progress = (ProgressBar) rowView.findViewById(R.id.progress);
            TextView noImageView = (TextView) rowView.findViewById(R.id.no_image);
            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);

//            List<Image> images = business.getImages();
//            if (images != null && !images.isEmpty()) {
//                Uri uri = Uri.parse(images.get(0).getThumbnail());
//                new DownloadImageTask(ConversationListActivity.this, imageView, progress).execute(uri);
//            } else {
//                progress.setVisibility(View.GONE);
//                noImageView.setVisibility(View.VISIBLE);
//            }
//            titleView.setText(business.getName());
//            int locationCount = business.getLocations().size();
//            if (locationCount == 1)
//                subtitleView.setText("Includes " + locationCount + " location");
//            else
//                subtitleView.setText("Includes " + locationCount + " locations");
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_conversation_list);
        list = (ListView) findViewById(R.id.conversation_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setLongClickable(true);
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Intent intent = new Intent(ConversationListActivity.this, LocationListActivity.class);
            intent.putExtra("business_id", ((Business)list.getItemAtPosition(position)).getId());
            startActivity(intent);
            }
        });
//        list.setOnItemLongClickListener(new AdapterView.OnItemLongClickListener() {
//            public boolean onItemLongClick(AdapterView<?> parent, View view, int position, long id) {
//            if (mActionMode != null)
//                return false;
//
//            // Start the CAB using the ActionMode.Callback defined above
//            list.setItemChecked(position, true);
//            mActionMode = startActionMode(mActionModeCallback);
//            return true;
//            }
//        });
        Log.d("ConversationList", "created");
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadConversations();
        Log.d("ConversationList", "resumed");
    }

    private void loadConversations() {
        showProgress(true);
        ReadApplicationsTask readApplications;
        if (getApi().getUser().isJobSeeker())
            readApplications = new ReadApplicationsTask(getApi());
        else
            readApplications = new ReadApplicationsTask(getApi()); // TODO filter by job
        readApplications.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
            @Override
            public void onSuccess(List<Application> result) {
                Log.d("ConversationList", "success");
                list.setAdapter(new ConversationListAdapter(result));
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(ConversationListActivity.this, "Error loading companies", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        readApplications.execute();
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.conversation_list);
    }
}
