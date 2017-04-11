package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.kaopiz.kprogresshud.KProgressHUD;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class TalentProfileFragment extends FormFragment {

    static final int MENU_SAVE = 10;
    static final int CVULOAD_CODE = 1;
    static final int PITCH_CODE = 2;

    @BindView(R.id.job_seeker_active)
    CheckBox mActiveView;

    @BindView(R.id.job_seeker_first_name)
    MaterialEditText mFirstNameView;
    @BindView(R.id.job_seeker_last_name)
    MaterialEditText mLastNameView;

    @BindView(R.id.job_seeker_email)
    MaterialEditText mEmailView;
    @BindView(R.id.job_seeker_email_public)
    CheckBox mEmailPublicView;

    @BindView(R.id.job_seeker_telephone)
    MaterialEditText mTelephoneView;
    @BindView(R.id.job_seeker_telephone_public)
    CheckBox mTelephonePublicView;

    @BindView(R.id.job_seeker_mobile)
    MaterialEditText mMobileView;
    @BindView(R.id.job_seeker_mobile_public)
    CheckBox mMobilePublicView;

    @BindView(R.id.job_seeker_age)
    MaterialEditText mAgeView;
    @BindView(R.id.job_seeker_age_public)
    CheckBox mAgePublicView;

    @BindView(R.id.job_seeker_sex)
    MaterialBetterSpinner mSexView;
    @BindView(R.id.job_seeker_sex_public)
    CheckBox mSexPublicView;

    @BindView(R.id.job_seeker_nationality)
    MaterialBetterSpinner mNationalityView;
    @BindView(R.id.job_seeker_nationality_public)
    CheckBox mNationalityPublicView;

    @BindView(R.id.job_seeker_description)
    MaterialEditText mDescriptionView;

    @BindView(R.id.job_seeker_cv_view)
    Button mCVViewButton;

    @BindView(R.id.job_seeker_cv_remove)
    View mCVUploadRemoveButton;
    @BindView(R.id.job_seeker_cv_filename)
    TextView mCVFilenameView;

    @BindView(R.id.job_seeker_video_play)
    View mRecordVideoPlay;

    @BindView(R.id.job_seeker_has_references)
    CheckBox mHasReferencesView;
    @BindView(R.id.job_seeker_tick_box)
    CheckBox mTickBox;

    List<String> mSexNames = new ArrayList<>();
    List<String> mNationalityNames = new ArrayList<>();

    JobSeeker jobSeeker;

    Pitch mPitch;
    String mVideoPath;
    int requestCode;

    String cvFileName;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_talent_profile, container, false);
        ButterKnife.bind(this, view);

        // menu
        addMenuItem("Save", -1);

        // data
        for (Sex sex : AppData.get(Sex.class)) {
            mSexNames.add(sex.getName());
        }
        mSexView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mSexNames));

        for (Nationality nationality : AppData.get(Nationality.class)) {
            mNationalityNames.add(nationality.getName());
        }
        mNationalityView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mNationalityNames));

        // loading
        if (AppData.user.getJob_seeker() != null) {
            view.setVisibility(View.INVISIBLE);
            new APITask("Loading...", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    AppData.existProfile = jobSeeker.getProfile() != null;
                }
                @Override
                protected void onSuccess() {
                    view.setVisibility(View.VISIBLE);
                    load();
                }
            };

        } else {
            mEmailView.setText(getApp().getEmail());
            mCVViewButton.setVisibility(View.GONE);
        }

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("firstName", mFirstNameView);
                put("lastName", mLastNameView);
                put("description", mDescriptionView);
            }
        };
    }

    void load() {

        mActiveView.setChecked(jobSeeker.isActive());
        mFirstNameView.setText(jobSeeker.getFirst_name());
        mLastNameView.setText(jobSeeker.getLast_name());
        mEmailView.setText(jobSeeker.getEmail());
        mEmailPublicView.setChecked(jobSeeker.getEmail_public());
        mTelephoneView.setText(jobSeeker.getTelephone());
        mTelephonePublicView.setChecked(jobSeeker.getTelephone_public());
        mMobileView.setText(jobSeeker.getMobile());
        mMobilePublicView.setChecked(jobSeeker.getMobile_public());
        if (jobSeeker.getAge() != null) {
            mAgeView.setText(jobSeeker.getAge().toString());
        }
        mAgePublicView.setChecked(jobSeeker.getAge_public());

        if (jobSeeker.getSex() != null) {
            mSexView.setText(AppData.get(Sex.class, jobSeeker.getSex()).getName());
        }
        mSexPublicView.setChecked(jobSeeker.getSex_public());
        if (jobSeeker.getNationality() != null) {
            mNationalityView.setText(AppData.get(Nationality.class, jobSeeker.getNationality()).getName());
        }
        mNationalityPublicView.setChecked(jobSeeker.getNationality_public());
        mDescriptionView.setText(jobSeeker.getDescription());

        mPitch = jobSeeker.getPitch();
        mRecordVideoPlay.setVisibility(mPitch != null && mPitch.getVideo() != null ? View.VISIBLE : View.INVISIBLE);

        mHasReferencesView.setChecked(jobSeeker.getHasReferences());
        mTickBox.setChecked(jobSeeker.getTruthConfirmation());

        mCVViewButton.setVisibility(jobSeeker.getCV() == null ? View.GONE : View.VISIBLE);

    }

    @OnClick(R.id.job_seeker_cv_help)
    void onCVHelp() {
        Popup.showGreen("CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", null, null, "Close", null, true);
    }

    @OnClick(R.id.job_seeker_cv_view)
    void onCVView() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(jobSeeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.job_seeker_cv_remove)
    void onCVRemove() {
        cvFileName = "";
        mCVFilenameView.setText("");
        mCVFilenameView.setVisibility(View.GONE);
        mCVUploadRemoveButton.setVisibility(View.GONE);
    }

    @OnClick(R.id.job_seeker_cv_upload)
    void onCVUpload() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        startActivityForResult(Intent.createChooser(intent, "Select File"), CVULOAD_CODE);
        requestCode = CVULOAD_CODE;
    }

    @OnClick(R.id.job_seeker_pitch_help)
    void onPitchHelp() {
        Popup.showGreen("Tips on how to record your pitch will be placed here.", null, null, "Close", null, true);
    }

    @OnClick(R.id.job_seeker_record_new)
    void onRecordNew() {
        Intent intent = new Intent(getApp(), CameraActivity.class);
        startActivityForResult(intent, PITCH_CODE);
        requestCode = PITCH_CODE;
    }

    @OnClick(R.id.job_seeker_video_play)
    void onPitchPlay() {
        String path = null;
        if (mVideoPath != null) {
            path = mVideoPath;
        } else if (mPitch != null) {
            path = mPitch.getVideo();
        }
        if (path != null) {
            Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
            intent.putExtra(MediaPlayerActivity.PATH, path);
            startActivity(intent);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (this.requestCode == CVULOAD_CODE) {
                Uri uri = data.getData();
                String src = uri.getPath();
                String[] tempStr = src.split("/");
                cvFileName = tempStr[tempStr.length-1];
                mCVFilenameView.setText("CV added, save to upload.");
                mCVFilenameView.setVisibility(View.VISIBLE);
                mCVUploadRemoveButton.setVisibility(View.VISIBLE);
            } else if (this.requestCode == PITCH_CODE) {
                mVideoPath = data.getStringExtra(CameraActivity.FILEPATH);
                mRecordVideoPlay.setVisibility(View.VISIBLE);
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == MENU_SAVE) {
            if (!valid()) return;

            if (!mTickBox.isChecked()) {
                Popup.showError("You must check the box confirming the truth of the information you have provided.");
                return;
            }

            Loading.show("Saving...");

            if (jobSeeker == null) {
                jobSeeker = new JobSeeker();
            }
            jobSeeker.setActive(mActiveView.isChecked());
            jobSeeker.setFirst_name(mFirstNameView.getText().toString().trim());
            jobSeeker.setLast_name(mLastNameView.getText().toString().trim());
            jobSeeker.setEmail(mEmailView.getText().toString().trim());
            jobSeeker.setEmail_public(mEmailPublicView.isChecked());
            jobSeeker.setTelephone(mTelephoneView.getText().toString().trim());
            jobSeeker.setTelephone_public(mTelephonePublicView.isChecked());
            jobSeeker.setMobile(mMobileView.getText().toString().trim());
            jobSeeker.setMobile_public(mMobilePublicView.isChecked());
            int sexIndex = mSexNames.indexOf(mSexView.getText().toString());
            if (sexIndex != -1) {
                jobSeeker.setSex(AppData.get(Sex.class).get(sexIndex).getId());
            }
            jobSeeker.setSex_public(mSexPublicView.isChecked());
            int nationalityIndex = mNationalityNames.indexOf(mNationalityView.getText().toString());
            if (nationalityIndex != -1) {
                jobSeeker.setNationality(AppData.get(Nationality.class).get(nationalityIndex).getId());
            }
            jobSeeker.setNationality_public(mNationalityPublicView.isChecked());
            jobSeeker.setDescription(mDescriptionView.getText().toString().trim());
            jobSeeker.setHasReferences(mHasReferencesView.isChecked());
            jobSeeker.setTruthConfirmation(mTickBox.isChecked());

            new APITask(this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    if (jobSeeker.getId() == null) {
                        jobSeeker = MJPApi.shared().create(JobSeeker.class, jobSeeker);
                        AppData.user.setJob_seeker(jobSeeker.getId());
                    } else {
                        jobSeeker = MJPApi.shared().updateJobSeeker(jobSeeker);
                    }
                    AppData.existProfile = jobSeeker.getProfile() != null;
                }
                @Override
                protected void onSuccess() {
                    if (mVideoPath == null) {
                        saveCompleted();
                    } else {
                        uploadPitch();
                    }
                }
            };

        }
    }

    void uploadPitch() {

        Loading.getLoadingBar().setMaxProgress(100);

        AWSPitchUploader pitchUploader = new AWSPitchUploader(getApp());
        PitchUpload upload = pitchUploader.upload(new File(mVideoPath));
        upload.setPitchUploadListener(new PitchUploadListener() {
            @Override
            public void onStateChange(int state) {
                switch (state) {
                    case PitchUpload.STARTING:
                        Loading.getLoadingBar().setLabel("Starting upload...");
                        break;
                    case PitchUpload.UPLOADING:
                        Loading.getLoadingBar().setStyle(KProgressHUD.Style.BAR_DETERMINATE);
                        Loading.getLoadingBar().setLabel("0%");
                        break;
                    case PitchUpload.PROCESSING:
                        Loading.getLoadingBar().setStyle(KProgressHUD.Style.SPIN_INDETERMINATE);
                        Loading.getLoadingBar().setLabel("Processing...");
                        break;
                    case PitchUpload.COMPLETE:
                        new APITask(TalentProfileFragment.this) {
                            @Override
                            protected void runAPI() throws MJPApiException {
                                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                            }
                            @Override
                            protected void onSuccess() {
                                mPitch = jobSeeker.getPitch();
                                mVideoPath = null;
                                saveCompleted();
                            }
                        };
                        break;
                }
            }

            @Override
            public void onProgress(double current, long total) {
                int complete = (int) (((float) current / total) * 100);
                if (complete < 100) {
                    Loading.getLoadingBar().setProgress(complete);
                    Loading.getLoadingBar().setLabel(Integer.toString(complete) + "%");
                }
            }

            @Override
            public void onError(String message) {
                Loading.hide();
                Popup.showError("Error uploading video!");
            }
        });
        upload.start();

    }

    void saveCompleted() {
        Loading.hide();
        Popup.showGreen("Success!", "OK", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!AppData.existProfile) {
                    getApp().reloadMenu();
                    getApp().setRootFragement(AppData.PAGE_JOB_PROFILE);
                }
            }
        }, null, null, true);
    }

}
