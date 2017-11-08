package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class TalentProfileFragment extends FormFragment {

    static final int REQUEST_NEW_PITCH = 2;

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
    MaterialEditText mNationalityView;
    @BindView(R.id.job_seeker_nationality_public)
    CheckBox mNationalityPublicView;

    @BindView(R.id.job_seeker_national_number)
    MaterialEditText mNationalNumberView;

    @BindView(R.id.job_seeker_description)
    MaterialEditText mDescriptionView;

    @BindView(R.id.job_seeker_cv_view)
    Button mCVViewButton;

    @BindView(R.id.job_seeker_cv_remove)
    View mCVUploadRemoveButton;
    @BindView(R.id.job_seeker_cv_comment)
    TextView mCVCommentView;

    @BindView(R.id.job_seeker_video_play)
    View mRecordVideoPlay;

    @BindView(R.id.job_seeker_has_references)
    CheckBox mHasReferencesView;
    @BindView(R.id.job_seeker_tick_box)
    CheckBox mTickBox;

    List<String> mSexNames = new ArrayList<>();
    JobSeeker jobSeeker;

    Pitch mPitch;
    String mVideoPath;
    int requestCode;

    Uri cvUri;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_talent_profile, container, false);
        ButterKnife.bind(this, view);

        // menu
        addMenuItem(MENUGROUP2, 100, "Save", -1);

        // data
        for (Sex sex : AppData.get(Sex.class)) {
            mSexNames.add(sex.getName());
        }
        mSexView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mSexNames));

        // loading
        if (AppData.user.getJob_seeker() != null) {
            showLoading(view);
            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    AppData.existProfile = jobSeeker.getProfile() != null;
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    hideLoading();
                    load();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        } else {
            mEmailView.setText(AppData.getEmail());
            mCVViewButton.setVisibility(View.GONE);
        }

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("first_name", mFirstNameView);
                put("last_name", mLastNameView);
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
        mNationalNumberView.setText(jobSeeker.getNational_insurance_number());

        mPitch = jobSeeker.getPitch();
        mRecordVideoPlay.setVisibility(mPitch != null && mPitch.getVideo() != null ? View.VISIBLE : View.INVISIBLE);

        mHasReferencesView.setChecked(jobSeeker.getHas_references());
        mTickBox.setChecked(jobSeeker.getTruth_confirmation());

        mCVViewButton.setVisibility(jobSeeker.getCV() == null ? View.GONE : View.VISIBLE);

    }

    @OnClick(R.id.job_seeker_nationality_button)
    void onNationality() {
        final List<Nationality> nationalities = AppData.get(Nationality.class);
        ArrayList<SelectItem> items = new ArrayList<>();
        for (Nationality nationality : nationalities) {
            items.add(new SelectItem(nationality.getName(), false));
        }

        new SelectDialog(getApp(), "Select Nationality", items, false, new SelectDialog.Action() {
            @Override
            public void apply(int selectedIndex) {
                mNationalityView.setText(nationalities.get(selectedIndex).getName());
            }
        });
    }

    @OnClick(R.id.job_seeker_cv_help)
    void onCVHelp() {
        Popup popup = new Popup(getContext(), "CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_cv_view)
    void onCVView() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(jobSeeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.job_seeker_cv_remove)
    void onCVRemove() {
        cvUri = null;
        mCVCommentView.setText("");
        mCVUploadRemoveButton.setVisibility(View.GONE);
    }

    @OnClick(R.id.job_seeker_cv_add_help)
    void onCVAddHelp() {
        Popup popup = new Popup(getContext(), "Upload your CV using your favourite cloud service, or take a photo if you have it printed out.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_cv_upload)
    void onCVUpload() {
        getApp().showFilePicker(false);
    }

    @OnClick(R.id.job_seeker_pitch_help)
    void onPitchHelp() {
        Popup popup = new Popup(getContext(), "Tips on how to record your pitch will be placed here.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_record_new)
    void onRecordNew() {
        Intent intent = new Intent(getApp(), CameraActivity.class);
        startActivityForResult(intent, REQUEST_NEW_PITCH);
        requestCode = REQUEST_NEW_PITCH;
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
            if (this.requestCode == REQUEST_NEW_PITCH) {
                mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);
                mRecordVideoPlay.setVisibility(View.VISIBLE);
            } else {
                if (requestCode == AppData.REQUEST_IMAGE_CAPTURE) {
                    Bitmap photo = (Bitmap) data.getExtras().get("data");
                    File file = AppHelper.saveBitmap(photo);
                    cvUri = Uri.fromFile(file);
                } else if (requestCode == AppData.REQUEST_IMAGE_PICK) {
                    String[] projection = { MediaStore.Images.Media.DATA };
                    Cursor cursor = getApp().getContentResolver().query(data.getData(), projection, null, null, null);
                    if(cursor != null) {
                        int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
                        cursor.moveToFirst();
                        String path = cursor.getString(column_index);
                        cvUri = Uri.fromFile(new File(path));
                    }
                } else if (requestCode == AppData.REQUEST_GOOGLE_DRIVE || requestCode == AppData.REQUEST_DROPBOX) {
                    String path = (String) data.getExtras().get("path");
                    cvUri = Uri.fromFile(new File(path));
                }
                if (cvUri != null) {
                    mCVCommentView.setText("CV added: save to upload.");
                    mCVUploadRemoveButton.setVisibility(View.VISIBLE);
                }
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            if (!valid()) return;

            if (!mTickBox.isChecked()) {
                Popup popup = new Popup(getContext(), "You must check the box confirming the truth of the information you have provided.", true);
                popup.addGreyButton("Ok", null);
                popup.show();
                return;
            }

            showLoading();

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
            if (!mAgeView.getText().toString().isEmpty()) {
                jobSeeker.setAge(Integer.parseInt(mAgeView.getText().toString()));
            }
            jobSeeker.setAge_public(mAgePublicView.isChecked());
            int sexIndex = mSexNames.indexOf(mSexView.getText().toString());
            if (sexIndex != -1) {
                jobSeeker.setSex(AppData.get(Sex.class).get(sexIndex).getId());
            }
            jobSeeker.setSex_public(mSexPublicView.isChecked());
            for (Nationality nationality : AppData.get(Nationality.class)) {
                if (nationality.getName().equals(mNationalityView.getText().toString())) {
                    jobSeeker.setNationality(nationality.getId());
                    break;
                }
            }
            jobSeeker.setNationality_public(mNationalityPublicView.isChecked());
            jobSeeker.setDescription(mDescriptionView.getText().toString().trim());
            jobSeeker.setHas_references(mHasReferencesView.isChecked());
            jobSeeker.setTruth_confirmation(mTickBox.isChecked());
            jobSeeker.setCV(null);
            if (!mNationalNumberView.getText().toString().isEmpty()) {
                jobSeeker.setNational_insurance_number(mNationalNumberView.getText().toString());
            } else {
                jobSeeker.setNational_insurance_number(null);
            }

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    if (jobSeeker.getId() == null) {
                        jobSeeker = MJPApi.shared().create(JobSeeker.class, jobSeeker);
                        AppData.user.setJob_seeker(jobSeeker.getId());
                    } else if (cvUri == null) {
                        jobSeeker = MJPApi.shared().updateJobSeeker(jobSeeker, null);
                    }

                    if (cvUri != null) {
                        try {
                            File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                            if (!dir.exists()) {
                                dir.mkdirs();
                            }
                            String filename = "cv_" + cvUri.getLastPathSegment();
                            File outputFile = new File(dir, filename);

                            try {
                                // Copy imageUri content to temp file
                                InputStream in = getApp().getContentResolver().openInputStream(cvUri);
                                try {
                                    FileOutputStream out = new FileOutputStream(outputFile);
                                    try {
                                        byte[] buf = new byte[1024];
                                        int len;
                                        while ((len = in.read(buf)) > 0)
                                            out.write(buf, 0, len);
                                    } finally {
                                        out.close();
                                    }
                                } finally {
                                    in.close();
                                }

                                // Upload image
                                try {
                                    jobSeeker = MJPApi.shared().updateJobSeeker(jobSeeker, new FileSystemResource(outputFile));
                                } catch (MJPApiException e) {
                                    e.printStackTrace();
                                    return;
                                }
                            } finally {
                                outputFile.delete();
                            }
                        } catch (IOException e) {
                            e.printStackTrace();
                            return;
                        }
                    }

                    AppData.existProfile = jobSeeker.getProfile() != null;

                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    if (mVideoPath == null) {
                        saveCompleted();
                    } else {
                        uploadPitch();
                    }
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        }
    }

    void uploadPitch() {

        AWSPitchUploader pitchUploader = new AWSPitchUploader(getApp());
        PitchUpload upload = pitchUploader.upload(new File(mVideoPath));
        upload.setPitchUploadListener(new PitchUploadListener() {
            @Override
            public void onStateChange(int state) {
                switch (state) {
                    case PitchUpload.STARTING:
                        break;
                    case PitchUpload.UPLOADING:
                        loading.setType(Loading.Type.PROGRESS);
                        break;
                    case PitchUpload.PROCESSING:
                        loading.setType(Loading.Type.SPIN);
                        break;
                    case PitchUpload.COMPLETE:
                        new APITask(new APIAction() {
                            @Override
                            public void run() throws MJPApiException {
                                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                            }
                        }).addListener(new APITaskListener() {
                            @Override
                            public void onSuccess() {
                                mPitch = jobSeeker.getPitch();
                                mVideoPath = null;
                                saveCompleted();
                            }
                            @Override
                            public void onError(JsonNode errors) {
                                errorHandler(errors);
                            }
                        }).execute();
                        break;
                }
            }

            @Override
            public void onProgress(double current, long total) {
                int complete = (int) (((float) current / total) * 100);
                if (complete < 100) {
                    loading.setProgress(complete);
                    loading.setLabel(Integer.toString(complete) + "%");
                }
            }

            @Override
            public void onError(String message) {
                hideLoading();
                Popup popup = new Popup(getContext(), "Error uploading video!", true);
                popup.addGreyButton("Ok", null);
                popup.show();
            }
        });
        upload.start();

    }

    void saveCompleted() {
        hideLoading();
        if (cvUri != null) {
            cvUri = null;
            mCVCommentView.setText("CV added");
            mCVUploadRemoveButton.setVisibility(View.GONE);
        } else {
            mCVCommentView.setText("");
        }

        mCVViewButton.setVisibility(jobSeeker.getCV() == null ? View.GONE : View.VISIBLE);

        Popup popup = new Popup(getContext(), "Success!", true);
        popup.addGreenButton("Ok", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!AppData.existProfile) {
                    getApp().reloadMenu();
                    getApp().setRootFragement(AppData.PAGE_JOB_PROFILE);
                }
            }
        });
        popup.show();
    }

}
