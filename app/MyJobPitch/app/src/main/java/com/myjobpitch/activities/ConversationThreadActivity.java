package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
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
import com.myjobpitch.tasks.ReadApplicationTask;

import java.util.List;

public class ConversationThreadActivity extends MJPProgressActionBarActivity  {

    private Integer applicationId;
    private Application application;
    private ListView list;

    class ConversationMessageAdapter extends CachingArrayAdapter<Message> {
        public ConversationMessageAdapter(List<Message> list) {
            super(ConversationThreadActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Message message) {
            LayoutInflater inflater = (LayoutInflater) ConversationThreadActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.conversation_thread_item, parent, false);

            TextView titleView = (TextView) rowView.findViewById(R.id.title);
            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
            TextView messageView = (TextView) rowView.findViewById(R.id.message);

            Job job = application.getJob_data();
            Location location = job.getLocation_data();
            Business business = location.getBusiness_data();
            JobSeeker jobSeeker = application.getJobSeeker();
            boolean applicationDeleted = application.getStatus().equals(getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.DELETED));

            boolean messageUnread = false;
            Role fromRole = null;
            CharSequence title = "";
            CharSequence subtitle = "";
            CharSequence content = "";
            String imageUri = null;

            if (!application.getMessages().isEmpty())
                message = application.getMessages().get(0);

            if (getApi().getUser().isRecruiter()) {
                fromRole = getMJPApplication().get(Role.class, Role.JOB_SEEKER);
                title = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();

                // TODO job seeker message image

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

            // TODO change based on filter?
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


            // Setup views
            titleView.setText(title);
            subtitleView.setText(subtitle);
            messageView.setText(content);

            if (messageUnread && applicationDeleted)
                titleView.setTypeface(null, Typeface.BOLD_ITALIC);
            else if (messageUnread)
                titleView.setTypeface(null, Typeface.BOLD);
            else if (applicationDeleted)
                titleView.setTypeface(null, Typeface.ITALIC);

            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        applicationId = getIntent().getIntExtra("application_id", -1);

        setContentView(R.layout.activity_conversation_thread);
        list = (ListView) findViewById(R.id.conversation_thread);
        list.setChoiceMode(ListView.CHOICE_MODE_SINGLE);
        Log.d("ConversationThread", "created");
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadConversation();
        Log.d("ConversationThread", "resumed");
    }

    private void loadConversation() {
        showProgress(true);
        ReadApplicationTask readApplication = new ReadApplicationTask(getApi(), applicationId);
        readApplication.addListener(new CreateReadUpdateAPITaskListener<Application>() {
            @Override
            public void onSuccess(Application result) {
                Log.d("ConversationThread", "success");
                list.setAdapter(new ConversationMessageAdapter(result.getMessages()));
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(ConversationThreadActivity.this, "Error loading messages", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        readApplication.execute();
    }

    @Override
    public View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.conversation_list);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                intent = NavUtils.getParentActivityIntent(this);
                startActivity(intent);
                finish();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

}
