package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Jobseeker;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.stfalcon.chatkit.commons.ImageLoader;
import com.stfalcon.chatkit.commons.models.IMessage;
import com.stfalcon.chatkit.commons.models.IUser;
import com.stfalcon.chatkit.messages.MessageHolders;
import com.stfalcon.chatkit.messages.MessageInput;
import com.stfalcon.chatkit.messages.MessagesList;
import com.stfalcon.chatkit.messages.MessagesListAdapter;

import java.text.SimpleDateFormat;
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

    @BindView(R.id.message_interview)
    LinearLayout messageInterview;

    @BindView(R.id.interview_date)
    TextView interviewDate;

    Application application;

    String myName;
    String myAvatar;
    String otherName;
    String otherAvatar;
    public Interview interview;

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
            Workplace workplace = job.getLocation_data();
            if (workplace.getImages().size() > 0) {
                jobImage = workplace.getImages().get(0).getThumbnail();
            } else {
                Business business = workplace.getBusiness_data();
                if (business.getImages().size() > 0) {
                    jobImage = business.getImages().get(0).getThumbnail();
                }
            }
        }

        Jobseeker jobseeker = application.getJob_seeker();
        String jobseekerImage = "icon_no_img";
        if (jobseeker.getPitch() != null) {
            jobseekerImage = jobseeker.getPitch().getThumbnail();
        }

        // show header info

        AppHelper.getItemAttributesView(headerView).setVisibility(View.GONE);

        if (interview == null) {
            for (Interview applicationInterview : application.getInterviews()) {
                if (applicationInterview.getStatus().equals(InterviewStatus.PENDING) || applicationInterview.getStatus().equals(InterviewStatus.ACCEPTED)) {
                    interview = applicationInterview;
                    break;
                }
            }
        }

        if (interview != null) {
            SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
            SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
            interviewDate.setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));
            messageInterview.setVisibility(View.VISIBLE);
        }

        if (AppData.user.isJobseeker()) {

            AppHelper.loadJobLogo(job, AppHelper.getImageView(headerView));
            AppHelper.getItemTitleView(headerView).setText(job.getTitle());
            AppHelper.getItemSubTitleView(headerView).setText(AppHelper.getBusinessName(job));

            myName = AppHelper.getJobseekerName(jobseeker);
            myAvatar = jobseekerImage;
            otherName = job.getLocation_data().getBusiness_data().getName();
            otherAvatar = jobImage;

            if (application.getStatus().intValue() != ApplicationStatus.ESTABLISHED_ID) {
                input.getInputEditText().setEnabled(false);
                input.getButton().setEnabled(false);

                if (application.getStatus().intValue() == ApplicationStatus.CREATED_ID) {
                    new Popup(getContext())
                            .setMessage("You cannot send message until your application is accepted.")
                            .addGreyButton("Ok", null)
                            .show();
                }

                if (application.getStatus().intValue() == ApplicationStatus.DELETED_ID) {
                    new Popup(getContext())
                            .setMessage("This application has been deleted.")
                            .addGreyButton("Ok", null)
                            .show();
                }
            }

        } else {

            AppHelper.loadJobseekerImage(jobseeker, AppHelper.getImageView(headerView));
            AppHelper.getItemTitleView(headerView).setText(AppHelper.getJobseekerName(jobseeker));
            AppHelper.getItemSubTitleView(headerView).setText(String.format("%s, %s", job.getTitle(), AppHelper.getBusinessName(job)));

            myName = job.getLocation_data().getBusiness_data().getName();
            myAvatar = jobImage;
            otherName = AppHelper.getJobseekerName(jobseeker);
            otherAvatar = jobseekerImage;

            if (interview == null) {
                addMenuItem(MENUGROUP1, 123, "Arrange Interview", R.drawable.menu_interview);
            }

        }

        // show chat list

        MessageHolders messageHolders = new MessageHolders()
                .setIncomingTextLayout(R.layout.view_message_incoming)
                .setOutcomingTextLayout(R.layout.view_message_outcoming);

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

        final MessagesListAdapter<MessageItem> adapter = new MessagesListAdapter<>("0", messageHolders, imageLoader);

        int interviewMsgId = -1;
        if (interview != null) {
            List<Message> interviewMsgs = interview.getMessages();
            interviewMsgId = interviewMsgs.get(interviewMsgs.size() - 1).getId();
        }

        List<MessageItem> messageItems = new ArrayList<>();
        for (int i=0; i<application.getMessages().size(); i++) {
            Message message = application.getMessages().get(i);
            String content = message.getContent();
            boolean isInterview = false;
            if (interviewMsgId != -1) {
                if (message.getId() == interviewMsgId) {
                    SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
                    SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
                    content = "Interview\n" + content + "\nInterview: " + format.format(interview.getAt()) + " at " + format1.format(interview.getAt());
                    isInterview = true;
                }
            }

            MessageItem messageItem = new MessageItem(i,
                    message.getFrom_role() == AppData.userRole ? "0" : "1",
                    content,
                    message.getCreated(),
                    isInterview);
            messageItems.add(messageItem);
        }
        adapter.addToEnd(messageItems, true);

        adapter.registerViewClickListener(R.id.messageText, new MessagesListAdapter.OnMessageViewClickListener<MessageItem>() {
            @Override
            public void onMessageViewClick(View view, MessageItem message) {
                if (message.isInterview) {
                    onClickInterview();
                }
            }
        });

        messagesList.setAdapter(adapter);

        // send message

        input.setInputListener(new MessageInput.InputListener() {
            @Override
            public boolean onSubmit(CharSequence input) {
                String text = input.toString();
                sendMessage(text);
                adapter.addToStart(new MessageItem(adapter.getItemCount(), "0", text, null, false), true);
                return true;
            }
        });
    }

    void sendMessage(String text) {
        final MessageForCreation messageForCreation = new MessageForCreation();
        messageForCreation.setApplication(application.getId());
        messageForCreation.setContent(text);

        new APITask(new APIAction() {
            @Override
            public void run() {
                MJPApi.shared().create(MessageForCreation.class, messageForCreation);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
            }
            @Override
            public void onError(JsonNode errors) {
            }
        }).execute();
    }

    @OnClick(R.id.header_view)
    void onClickHeader() {
        if (AppData.user.isJobseeker()) {
            ApplicationDetailsFragment fragment = new ApplicationDetailsFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        } else {
            TalentDetailsFragment fragment = new TalentDetailsFragment();
            fragment.application = application;
            fragment.viewMode = true;
            getApp().pushFragment(fragment);
        }
    }

    @OnClick(R.id.message_interview)
    void onClickInterview() {
        InterviewDetailsFragment fragment = new InterviewDetailsFragment();
        fragment.interviewId = interview.getId();
        fragment.application = application;
        getApp().pushFragment(fragment);
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 122) {
            InterviewEditFragment fragment = new InterviewEditFragment();
            fragment.application = application;
            fragment.mode = "EDIT";
            fragment.interview = interview;
            getApp().pushFragment(fragment);
        } else if (menuID == 123) {
            InterviewEditFragment fragment = new InterviewEditFragment();
            fragment.application = application;
            fragment.mode = "NEW";
            getApp().pushFragment(fragment);
        }
    }

    class MessageItem implements IMessage {
        int id;
        String userId;
        String text;
        Date createdAt;
        boolean isInterview;

        public MessageItem(int id, String userId, String text, Date createdAt, boolean isInterview) {
            this.id = id;
            this.userId = userId;
            this.text = text;
            this.createdAt = createdAt;
            this.isInterview = isInterview;
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
