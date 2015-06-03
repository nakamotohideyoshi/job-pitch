package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.api.data.MessageForUpdate;
import com.myjobpitch.api.data.MessageLocal;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.tasks.CreateMessageTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadApplicationTask;
import com.myjobpitch.tasks.UpdateMessageTask;
import com.myjobpitch.utils.Utils;

import java.util.Calendar;
import java.util.List;

public class ConversationThreadActivity extends MJPProgressActionBarActivity  {

    private Integer applicationId;
    private Application application;
    private ListView list;
    private TextView titleView;
    private TextView subtitleView;
    private ImageView imageView;
    private ProgressBar imageProgress;
    private TextView noImageView;
    private TextView messageView;
    private Button sendButton;
    private ConversationMessageAdapter messageAdapter;
    private CreateMessageTask createMessageTask = null;

    class ConversationMessageAdapter extends CachingArrayAdapter<Message> {
        public ConversationMessageAdapter(List<Message> list) {
            super(ConversationThreadActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Message message) {
            LayoutInflater inflater = (LayoutInflater) ConversationThreadActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View rowView = inflater.inflate(R.layout.conversation_thread_item, parent, false);

            TextView messageView = (TextView) rowView.findViewById(R.id.message);
            TextView metaView = (TextView) rowView.findViewById(R.id.meta);;

            Business business = application.getJob_data().getLocation_data().getBusiness_data();
            JobSeeker jobSeeker = application.getJobSeeker();

            Role userRole = null;
            Role fromRole = getMJPApplication().get(Role.class, message.getFrom_role());
            String fromName;

            if (getApi().getUser().isRecruiter())
                userRole = getMJPApplication().get(Role.class, Role.RECRUITER);
            else
                userRole = getMJPApplication().get(Role.class, Role.JOB_SEEKER);

            if (fromRole.getName().equals(Role.JOB_SEEKER))
                fromName = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
            else
                fromName = business.getName();

            // Setup views
            if (userRole.equals(fromRole))
                rowView.setPadding(rowView.getPaddingLeft() * 8, rowView.getPaddingTop(), rowView.getPaddingRight(), rowView.getPaddingBottom());
            else
                rowView.setPadding(rowView.getPaddingLeft(), rowView.getPaddingTop(), rowView.getPaddingRight() * 8, rowView.getPaddingBottom());
            messageView.setText(message.getContent());
            metaView.setText(String.format("%s, %s", fromName, Utils.formatDateTime(message.getCreated())));
            return rowView;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        applicationId = getIntent().getIntExtra("application_id", -1);

        setContentView(R.layout.activity_conversation_thread);
        list = (ListView) findViewById(R.id.conversation_thread);

        titleView = (TextView) findViewById(R.id.title);
        subtitleView = (TextView) findViewById(R.id.subtiltle);
        imageView = (ImageView) findViewById(R.id.image);
        noImageView = (TextView) findViewById(R.id.no_image);
        imageProgress = (ProgressBar) findViewById(R.id.image_progress);
        
        messageView = (TextView) findViewById(R.id.message);
        sendButton = (Button) findViewById(R.id.send_button);
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final String content = messageView.getText().toString().trim();
                if (!content.isEmpty()) {
                    MessageForCreation messageData = new MessageForCreation();
                    messageData.setApplication(applicationId);
                    messageData.setContent(content);
                    final MessageLocal message = new MessageLocal();
                    message.setApplication(applicationId);
                    message.setContent("...");
                    message.setCreated(Calendar.getInstance().getTime());
                    Integer fromRole = getMJPApplication().get(Role.class, getApi().getUser().isRecruiter() ? Role.RECRUITER : Role.JOB_SEEKER).getId();
                    message.setFrom_role(fromRole);
                    message.setRead(false);
                    message.setSystem(false);
                    messageAdapter.add(message);
                    messageView.setEnabled(false);
                    sendButton.setEnabled(false);
                    createMessageTask = new CreateMessageTask(getApi(), messageData);
                    createMessageTask.addListener(new CreateReadUpdateAPITaskListener<MessageForCreation>() {
                        @Override
                        public void onSuccess(MessageForCreation result) {
                            message.setContent(content);
                            messageAdapter.notifyDataSetChanged();
                            messageView.setText("");
                            sendButton.setEnabled(true);
                            messageView.setEnabled(true);
                            createMessageTask = null;
                        }

                        @Override
                        public void onError(JsonNode errors) {
                            messageAdapter.remove(message);
                            Toast toast = Toast.makeText(ConversationThreadActivity.this, "Error sending message", Toast.LENGTH_LONG);
                            toast.show();
                            messageView.setEnabled(true);
                            sendButton.setEnabled(true);
                            createMessageTask = null;
                        }

                        @Override
                        public void onConnectionError() {
                            messageAdapter.remove(message);
                            Toast toast = Toast.makeText(ConversationThreadActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                            toast.show();
                            messageView.setEnabled(true);
                            sendButton.setEnabled(true);
                            createMessageTask = null;
                        }

                        @Override
                        public void onCancelled() {}
                    });
                    createMessageTask.execute();
                }
            }
        });

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
                application = result;
                Log.d("ConversationThread", "success");
                messageAdapter = new ConversationMessageAdapter(application.getMessages());
                list.setAdapter(messageAdapter);

                Job job = application.getJob_data();
                Location location = job.getLocation_data();
                Business business = location.getBusiness_data();

                String imageUri = null;
                String title;
                Role fromRole;

                if (getApi().getUser().isRecruiter()) {
                    JobSeeker jobSeeker = application.getJob_seeker();
                    title = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
                    fromRole = getMJPApplication().get(Role.class, Role.JOB_SEEKER);

                    // TODO job seeker message image

                } else {
                    title = business.getName();
                    fromRole = getMJPApplication().get(Role.class, Role.RECRUITER);

                    if (job.getImages() != null && !job.getImages().isEmpty())
                        imageUri = job.getImages().get(0).getThumbnail();
                    else if (location.getImages() != null && !location.getImages().isEmpty())
                        imageUri = location.getImages().get(0).getThumbnail();
                    else if (business.getImages() != null && !business.getImages().isEmpty())
                        imageUri = business.getImages().get(0).getThumbnail();
                }

                // Setup views
                titleView.setText(title);
                subtitleView.setText(String.format("Job: %s (%s, %s)\n", job.getTitle(), location.getName(), business.getName()));
                if (imageUri != null) {
                    Uri uri = Uri.parse(imageUri);
                    new DownloadImageTask(ConversationThreadActivity.this, imageView, imageProgress).execute(uri);
                } else {
                    imageProgress.setVisibility(View.GONE);
                    noImageView.setVisibility(View.VISIBLE);
                }

                showProgress(false);

                Message lastUnreadMessage = null;
                for (Message message : application.getMessages())
                    if (message.getFrom_role().equals(fromRole.getId()) && !message.getRead())
                        lastUnreadMessage = message;

                if (lastUnreadMessage != null) {
                    MessageForUpdate messageUpdate = new MessageForUpdate();
                    messageUpdate.setId(lastUnreadMessage.getId());
                    messageUpdate.setRead(true);
                    UpdateMessageTask updateMessageTask = new UpdateMessageTask(getApi(), messageUpdate);
                    updateMessageTask.execute();
                }
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(ConversationThreadActivity.this, "Error loading messages", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(ConversationThreadActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
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
        return findViewById(R.id.conversion_thread_main);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                if (createMessageTask == null) {
                    finish();
                    intent = NavUtils.getParentActivityIntent(this);
                    startActivity(intent);
                }
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public void onBackPressed() {
        if (createMessageTask == null)
            super.onBackPressed();
    }
}
