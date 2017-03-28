package com.myjobpitch.fragments;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.stfalcon.chatkit.commons.ImageLoader;
import com.stfalcon.chatkit.commons.models.IMessage;
import com.stfalcon.chatkit.commons.models.IUser;
import com.stfalcon.chatkit.messages.MessageInput;
import com.stfalcon.chatkit.messages.MessagesList;
import com.stfalcon.chatkit.messages.MessagesListAdapter;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class MessageFragment extends BaseFragment {

    @BindView(R.id.header_view)
    View headerView;

    @BindView(R.id.messagesList)
    MessagesList messagesList;

    @BindView(R.id.input)
    MessageInput input;

    Application application;

    String myName;
    String myAvatar;
    String otherName;
    String otherAvatar;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view =  inflater.inflate(R.layout.fragment_message, container, false);
        ButterKnife.bind(this, view);

        title = "Message";

        // get data

        if (application != null) {
            load();
        }

        return view;
    }

    void load() {

        // get application info

        Job job = application.getJob_data();
        String jobImage = "default_logo";
        if (job.getImages().size() > 0) {
            jobImage = job.getImages().get(0).getThumbnail();
        } else {
            Location location = job.getLocation_data();
            if (location.getImages().size() > 0) {
                jobImage = location.getImages().get(0).getThumbnail();
            } else {
                Business business = location.getBusiness_data();
                if (business.getImages().size() > 0) {
                    jobImage = business.getImages().get(0).getThumbnail();
                }
            }
        }

        JobSeeker jobSeeker = application.getJobSeeker();
        String jobSeekerImage = "icon_no_img";
        if (jobSeeker.getPitch() != null) {
            jobSeekerImage = jobSeeker.getPitch().getThumbnail();
        }

        // show header info

        AppHelper.getItemAttributesView(headerView).setVisibility(View.GONE);

        if (AppData.user.isJobSeeker()) {

            AppHelper.loadJobLogo(job, AppHelper.getImageView(headerView));
            AppHelper.getItemTitleView(headerView).setText(job.getTitle());
            AppHelper.getItemSubTitleView(headerView).setText(job.getFullBusinessName());

            myName = jobSeeker.getFullName();
            myAvatar = jobSeekerImage;
            otherName = job.getLocation_data().getBusiness_data().getName();
            otherAvatar = jobImage;

        } else {

            AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(headerView));
            AppHelper.getItemTitleView(headerView).setText(jobSeeker.getFullName());
            AppHelper.getItemSubTitleView(headerView).setText(String.format("%s (%s)", job.getTitle(), job.getFullBusinessName()));

            myName = job.getLocation_data().getBusiness_data().getName();
            myAvatar = jobImage;
            otherName = jobSeeker.getFullName();
            otherAvatar = jobSeekerImage;

        }

        // show chat list

        MessagesListAdapter.HoldersConfig holdersConfig = new MessagesListAdapter.HoldersConfig();
        holdersConfig.setIncomingLayout(R.layout.view_message_incoming);
        holdersConfig.setOutcomingLayout(R.layout.view_message_outcoming);

        ImageLoader imageLoader = new ImageLoader() {
            @Override
            public void loadImage(ImageView imageView, String url) {
                if (url.equals("default_logo")) {
                    imageView.setImageResource(R.drawable.default_logo);
                } else if (url.equals("icon_no_img")) {
                    imageView.setImageResource(R.drawable.icon_no_img);
                } else {
                    AppHelper.loadImage(url, imageView);
                }
            }
        };

        final MessagesListAdapter<MessageItem> adapter = new MessagesListAdapter<>("0", holdersConfig, imageLoader);

        List<MessageItem> messageItems = new ArrayList<>();
        for (int i=0; i<application.getMessages().size(); i++) {
            Message message = application.getMessages().get(i);
            MessageItem messageItem = new MessageItem(i,
                    message.getFrom_role() == AppData.getUserRole().getId() ? "0" : "1",
                    message.getContent(),
                    message.getCreated());
            messageItems.add(messageItem);
        }
        adapter.addToEnd(messageItems, true);

        messagesList.setAdapter(adapter);

        // send message

        input.setInputListener(new MessageInput.InputListener() {
            @Override
            public boolean onSubmit(CharSequence input) {
                String text = input.toString();
                sendMessage(text);
                adapter.addToStart(new MessageItem(adapter.getItemCount(), "0", text, null), true);
                return true;
            }
        });
    }

    void sendMessage(String text) {
        final MessageForCreation messageForCreation = new MessageForCreation();
        messageForCreation.setApplication(application.getId());
        messageForCreation.setContent(text);

        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... params) {
                try {
                    MJPApi.shared().create(MessageForCreation.class, messageForCreation);
                    return true;
                } catch (MJPApiException e) {
                    return false;
                }
            }
            @Override
            protected void onPostExecute(final Boolean success) {
            }
        }.execute();
    }

    @OnClick(R.id.header_view)
    void onClickHeader() {
        if (AppData.user.isJobSeeker()) {
            ApplicationDetailFragment fragment = new ApplicationDetailFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        } else {
            TalentDetailFragment fragment = new TalentDetailFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        }
    }

    class MessageItem implements IMessage {
        int id;
        String userId;
        String text;
        Date createdAt;

        public MessageItem(int id, String userId, String text, Date createdAt) {
            this.id = id;
            this.userId = userId;
            this.text = text;
            this.createdAt = createdAt;
        }

        @Override
        public Date getCreatedAt() {
            return createdAt == null ? new Date() : createdAt;
        }

        @Override
        public String getId() {
            return String.valueOf(id);
        }

        @Override
        public IUser getUser() {
            return new User(userId);
        }

        @Override
        public String getText() {
            return text;
        }
    }

    class User implements IUser {
        private String id;
        private String name;
        private String avatar;

        public User(String id) {
            this.id = id;
            this.name = id.equals("0") ? myName : otherName;
            this.avatar = id.equals("0") ? myAvatar : otherAvatar;
        }

        @Override
        public String getId() {
            return id;
        }

        @Override
        public String getName() {
            return name;
        }

        @Override
        public String getAvatar() {
            return avatar;
        }
    }

}