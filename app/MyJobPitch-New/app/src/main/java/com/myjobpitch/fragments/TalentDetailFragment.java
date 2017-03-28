package com.myjobpitch.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.TextView;

import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateApplication;
import com.myjobpitch.tasks.DeleteApplication;
import com.myjobpitch.tasks.TaskListener;
import com.myjobpitch.tasks.UpdateApplication;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageLoader;
import com.myjobpitch.utils.Popup;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class TalentDetailFragment extends BaseFragment {

    @BindView(R.id.jobseeker_image_view)
    View imageView;

    @BindView(R.id.jobseeker_name)
    TextView nameView;

    @BindView(R.id.jobseeker_subtitle)
    TextView subTitleView;

    @BindView(R.id.jobseeker_pitch_play)
    View playButton;

    @BindView(R.id.jobseeker_desc)
    TextView descView;

    @BindView(R.id.jobseeker_cv)
    Button cvButton;

    @BindView(R.id.jobseeker_available)
    View availableView;
    @BindView(R.id.jobseeker_truthful)
    View truthfulView;

    @BindView(R.id.jobseeker_contact_view)
    View contactView;
    @BindView(R.id.jobseeker_contact)
    TextView contactInfoView;
    @BindView(R.id.shortlisted)
    CheckBox shortlistedView;

    @BindView(R.id.apply_button)
    Button applyButton;
    @BindView(R.id.remove_button)
    Button removeButton;

    boolean connected;

    public Application application;

    public JobSeeker jobSeeker;
    public Job job;
    public Action action;

    public boolean viewMode = false;

    public interface Action {
        void apply();
        void remove();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_talent_detail, container, false);
        ButterKnife.bind(this, view);

        title = "Talent Detail";

        if (application != null) {
            jobSeeker = application.getJobSeeker();
            connected = application.getStatus() == AppData.get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
        }

        load();

        return view;
    }

    void load() {

        AppHelper.loadJobSeekerImage(jobSeeker, AppHelper.getImageView(imageView));

        nameView.setText(jobSeeker.getFullName());
        Sex sex = AppData.get(Sex.class, jobSeeker.getSex());

        String subTitle = "";
        if (jobSeeker.getAge() != null && jobSeeker.getAge_public()) {
            subTitle = jobSeeker.getAge().toString() + " ";
        }
        if (sex != null && jobSeeker.getSex_public()) {
            subTitle += sex.getShort_name();
        }
        subTitleView.setText(subTitle);

        descView.setText(jobSeeker.getDescription());

        if (jobSeeker.getPitch() == null) {
            playButton.setVisibility(View.GONE);
        }

        if (!jobSeeker.getHasReferences()) {
            availableView.setVisibility(View.GONE);
        }

        if (!jobSeeker.getTruthConfirmation()) {
            truthfulView.setVisibility(View.GONE);
        }

        if (connected) {
            if (jobSeeker.getCV() == null) {
                cvButton.setVisibility(View.GONE);
            }

            String contact = "";
            if (jobSeeker.getEmail_public()) {
                contact += jobSeeker.getEmail() + "\n";
            }
            if (jobSeeker.getMobile() != null && !jobSeeker.getMobile().isEmpty() && jobSeeker.getMobile_public()) {
                contact += jobSeeker.getMobile() + "\n";
            }
            if (!contact.isEmpty()) {
                contactInfoView.setText(contact);
            } else {
                contactInfoView.setText("No contact details supplied");
            }

            shortlistedView.setChecked(application.getShortlisted());
            shortlistedView.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
                @Override
                public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                    changedShortlist();
                }
            });

        } else {
            cvButton.setVisibility(View.GONE);
            contactView.setVisibility(View.GONE);
            applyButton.setText("Connect");
        }

        if (viewMode) {
            applyButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.GONE);
        }

    }

    void changedShortlist() {
        application.setShortlisted(shortlistedView.isChecked());
        final ApplicationShortlistUpdate update = new ApplicationShortlistUpdate(application);

        AppHelper.showLoading("Updating...");
        new AsyncTask<Void, Void, Boolean>() {
            @Override
            protected Boolean doInBackground(Void... params) {
                try {
                    MJPApi.shared().updateApplicationShortlist(update);
                    return true;
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return false;
                }
            }
            @Override
            protected void onPostExecute(Boolean success) {
                AppHelper.hideLoading();
            }
        }.execute();
    }

    @OnClick(R.id.jobseeker_pitch_play)
    void onPitchPlay() {
        Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
        intent.putExtra(MediaPlayerActivity.PATH, jobSeeker.getPitch().getVideo());
        startActivity(intent);
    }

    @OnClick(R.id.jobseeker_cv)
    void onViewCV() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(jobSeeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.apply_button)
    void onApply() {
        if (connected) {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        } else {
            String message = application == null ? "Are you sure you want to connect this talent?" : "Are you sure you want to connect this application?";
            Popup.showYellow(message, "Connect", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    if (application == null) {
                        new CreateApplication(job.getId(), jobSeeker.getId(), new TaskListener<Application>() {
                            @Override
                            public void done(Application application) {
                                action.apply();
                                getApp().popFragment();
                            }
                            @Override
                            public void error(String error) {
                                if (error.equals("NO_TOKENS")) {
                                    Popup.showMessage("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                                }
                            }
                        });
                    } else {
                        Integer established = AppData.get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
                        new UpdateApplication(application, established, new TaskListener() {
                            @Override
                            public void done(Object result) {
                                getApp().popFragment();
                            }
                            @Override
                            public void error(String error) {
                                if (error.equals("NO_TOKENS")) {
                                    Popup.showMessage("You have no credits left so cannot compete this connection. Credits cannot be added through the app, please go to our web page.");
                                }
                            }
                        });
                    }
                }
            }, "Cancel", null, true);
        }
    }

    @OnClick(R.id.remove_button)
    void onRemove() {
        String message = application == null ? "Are you sure you want to delete this talent?" : "Are you sure you want to delete this application?";
        Popup.showYellow(message, "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (application == null) {
                    action.remove();
                    getApp().popFragment();
                } else {
                    new DeleteApplication(application.getId(), new TaskListener() {
                        @Override
                        public void done(Object result) {
                            getApp().popFragment();
                        }
                        @Override
                        public void error(String error) {
                        }
                    });
                }
            }
        }, "Cancel", null, true);
    }

}
