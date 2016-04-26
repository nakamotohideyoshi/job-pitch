package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
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
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadApplicationsTask;

import java.util.List;

public class ConversationListActivity extends MJPProgressActionBarActivity  {

    private ListView list;

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
            TextView messageView = (TextView) rowView.findViewById(R.id.message);

            Job job = application.getJob_data();
            Location location = job.getLocation_data();
            Business business = location.getBusiness_data();
            JobSeeker jobSeeker = application.getJobSeeker();
            boolean applicationDeleted = application.getStatus().equals(getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.DELETED));

            Message message = null;
            Role fromRole = null;
            CharSequence title = "";
            CharSequence subtitle = "";
            CharSequence content = "";
            String imageUri = null;

            if (!application.getMessages().isEmpty())
                message = application.getMessages().get(application.getMessages().size()-1);

            if (getApi().getUser().isRecruiter()) {
                fromRole = getMJPApplication().get(Role.class, Role.JOB_SEEKER);
                title = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
                if (jobSeeker.hasPitch())
                    imageUri = jobSeeker.getPitch().getThumbnail();
            } else {
                fromRole = getMJPApplication().get(Role.class, Role.RECRUITER);
                title = business.getName();

                if (job.getImages() != null && !job.getImages().isEmpty())
                    imageUri = job.getImages().get(0).getThumbnail();
                else if (location.getImages() != null && !location.getImages().isEmpty())
                    imageUri = location.getImages().get(0).getThumbnail();
                else if (business.getImages() != null && !business.getImages().isEmpty())
                    imageUri = business.getImages().get(0).getThumbnail();
            }

            subtitle = String.format("%s (%s, %s)\n", job.getTitle(), location.getName(), business.getName());

            if (message == null)
                content = getString(R.string.no_messages);
            else {
                StringBuilder contentBuilder = new StringBuilder();
                if (!fromRole.getId().equals(message.getFrom_role()))
                    contentBuilder.append("You: ");
                contentBuilder.append(message.getContent().replace('\n', ' '));
                content = contentBuilder;
            }

            // Find the last message from the other user, and check
            // its "read" state

            Message lastMessage = null;
            for (Message m : application.getMessages())
                if (message.getFrom_role().equals(fromRole.getId()))
                    lastMessage = message;

            // Setup views
            if (imageUri != null) {
                Uri uri = Uri.parse(imageUri);
                new DownloadImageTask(ConversationListActivity.this, imageView, progress).executeOnExecutor(DownloadImageTask.executor, uri);
            } else {
                progress.setVisibility(View.GONE);
                noImageView.setVisibility(View.VISIBLE);
            }

            titleView.setText(title);
            subtitleView.setText(subtitle);
            messageView.setText(content);

            if (lastMessage != null) {
                if (!lastMessage.getRead() && applicationDeleted)
                    titleView.setTypeface(null, Typeface.BOLD_ITALIC);
                else if (!lastMessage.getRead())
                    titleView.setTypeface(null, Typeface.BOLD);
                else if (applicationDeleted)
                    titleView.setTypeface(null, Typeface.ITALIC);
            } else {
                if (applicationDeleted)
                    titleView.setTypeface(null, Typeface.ITALIC);
            }

            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_conversation_list);
        list = (ListView) findViewById(R.id.conversation_list);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        list.setEmptyView(findViewById(android.R.id.empty));
        list.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            Intent intent = new Intent(ConversationListActivity.this, ConversationThreadActivity.class);
            intent.putExtra(ConversationThreadActivity.APPLICATION_ID, ((Application) list.getItemAtPosition(position)).getId());
            startActivity(intent);
            }
        });
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
        if (getApi().getUser().isRecruiter())
            readApplications = new ReadApplicationsTask(getApi()); // TODO filter by job
        else
            readApplications = new ReadApplicationsTask(getApi());
        readApplications.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
            @Override
            public void onSuccess(List<Application> result) {
                Log.d("ConversationList", "success");
                list.setAdapter(new ConversationListAdapter(result));
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(ConversationListActivity.this, "Error loading messages", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(ConversationListActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
        return findViewById(R.id.conversion_list_main);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

}
