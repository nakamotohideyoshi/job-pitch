package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
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
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.activities.CameraActivity;
import com.myjobpitch.MainActivity;
import com.myjobpitch.activities.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.activities.WebviewActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobSeekerForUpdate;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Pitch;
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

    static final int REQUEST_NEW_PITCH = 1;

    @BindView(R.id.image_view)
    ImageView mAvatarView;
    @BindView(R.id.progress_bar)
    ProgressBar progressBar;

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

    @BindView(R.id.job_seeker_cv_clear)
    View mCVClearButton;
    @BindView(R.id.job_seeker_cv_remove)
    View mCVRemoveButton;
    @BindView(R.id.job_seeker_cv_comment)
    TextView mCVCommentView;

    @BindView(R.id.job_seeker_video_play)
    View mPitchPlayButton;

    @BindView(R.id.job_seeker_has_references)
    CheckBox mHasReferencesView;
    @BindView(R.id.job_seeker_tick_box)
    CheckBox mTickBox;

    List<String> mSexNames;

    boolean isAvatarSelector = false;
    Uri avatarUri;
    Uri cvUri;
    boolean removedCV = false;

    Pitch mPitch;
    String mVideoPath;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_talent_profile, container, false);
        ButterKnife.bind(this, view);

        title = "Edit Profile";

        // data
        mSexNames = AppHelper.getNames(AppData.sexes);
        mSexView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mSexNames));

        if (AppData.jobSeeker == null) {
            mAvatarView.setImageResource(R.drawable.avatar);
            mEmailView.setText(AppData.getEmail());
            mCVViewButton.setVisibility(View.GONE);
        } else {
        load();
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

        JobSeeker jobSeeker = AppData.jobSeeker;

        final String imagePath = jobSeeker.getProfile_image();
        if (imagePath != null) {
            AppHelper.loadImage(imagePath, mAvatarView);
        } else {
            mAvatarView.setImageResource(R.drawable.avatar);
        }

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
            mSexView.setText(AppData.getNameById(AppData.sexes, jobSeeker.getSex()));
        }
        mSexPublicView.setChecked(jobSeeker.getSex_public());

        if (jobSeeker.getNationality() != null) {
            mNationalityView.setText(AppData.getNameById(AppData.nationalities, jobSeeker.getNationality()));
        }
        mNationalityPublicView.setChecked(jobSeeker.getNationality_public());

        mNationalNumberView.setText(jobSeeker.getNational_insurance_number());

        mDescriptionView.setText(jobSeeker.getDescription());

        mCVViewButton.setVisibility(jobSeeker.getCV() == null ? View.GONE : View.VISIBLE);
        mCVRemoveButton.setVisibility(jobSeeker.getCV() == null ? View.GONE : View.VISIBLE);

        mPitch = jobSeeker.getPitch();
        mPitchPlayButton.setVisibility(mPitch != null && mPitch.getVideo() != null ? View.VISIBLE : View.INVISIBLE);

        mHasReferencesView.setChecked(jobSeeker.getHas_references());
        mTickBox.setChecked(jobSeeker.getTruth_confirmation());
    }

    @OnClick(R.id.image_view)
    void onPhotoAction1() {
        isAvatarSelector = true;
        getApp().showFilePicker(true);
    }

    @OnClick(R.id.avata_add_button)
    void onPhotoAction2() {
        isAvatarSelector = true;
        getApp().showFilePicker(true);
    }

    @OnClick(R.id.job_seeker_active)
    void onActivate() {
        if (!mActiveView.isChecked()) {
            Popup popup = new Popup(getContext(), "Your profile will not be visible and will not be able to apply for jobs or send messages", true);
            popup.addGreenButton("Deactivate", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                }
            });
            popup.addGreyButton("Cancel", new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    mActiveView.setChecked(true);
                }
            });
            popup.show();
        }
    }

    @OnClick(R.id.job_seeker_nationality_button)
    void onNationality() {
        ArrayList<SelectItem> items = new ArrayList<>();
        for (Nationality nationality : AppData.nationalities) {
            items.add(new SelectItem(nationality.getName(), false));
        }

        new SelectDialog(getApp(), "Select Nationality", items, false, new SelectDialog.Action() {
            @Override
            public void apply(int selectedIndex) {
                mNationalityView.setText(AppData.nationalities.get(selectedIndex).getName());
            }
        });
    }

    @OnClick(R.id.job_seeker_national_number_help)
    void onNationalNumberHelp() {
        Popup popup = new Popup(getContext(), "Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_cv_help)
    void onCVHelp() {
        Popup popup = new Popup(getContext(), "CV summary is what the recruiter first see, write if you have previous relevant experience where and for how long.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_cv_add_help)
    void onCVAddHelp() {
        Popup popup = new Popup(getContext(), "Upload your CV using your favourite cloud service, or take a photo if you have it printed out.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_seeker_cv_view)
    void onCVView() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse(AppData.jobSeeker.getCV()));
        startActivity(intent);
    }

    @OnClick(R.id.job_seeker_cv_remove)
    void onCVRemove() {
        removedCV = true;
        mCVViewButton.setVisibility(View.GONE);
        mCVRemoveButton.setVisibility(View.GONE);
    }

    @OnClick(R.id.job_seeker_cv_clear)
    void onCVClear() {
        cvUri = null;
        mCVCommentView.setText("");
        mCVClearButton.setVisibility(View.GONE);
    }

    @OnClick(R.id.job_seeker_cv_upload)
    void onCVAdd() {
        isAvatarSelector = false;
        getApp().showFilePicker(false);
    }

    @OnClick(R.id.job_seeker_pitch_help)
    void onPitchHelp() {
        Intent intent = new Intent(getApp(), WebviewActivity.class);
        intent.putExtra(WebviewActivity.TITLE, "Record Pitch");
        intent.putExtra(WebviewActivity.FILENAME, "pitch");
        getApp().startActivity(intent);
//        getApp().overridePendingTransition(R.anim.slide_up, R.anim.slide_down);
    }

    @OnClick(R.id.example_video)
    void onPitchDemo() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("https://vimeo.com/255467562"));
        getApp().startActivity(intent);
    }

    @OnClick(R.id.job_seeker_record_new)
    void onRecordNew() {
        Intent intent = new Intent(getApp(), CameraActivity.class);
        getApp().startActivityForResult(intent, REQUEST_NEW_PITCH);
    }

    @OnClick(R.id.job_seeker_video_play)
    void onPitchPlay() {
        String path = mVideoPath;
        if (mVideoPath == null && mPitch != null) {
            path = mPitch.getVideo();
        }
        if (path != null) {
            Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
            intent.putExtra(MediaPlayerActivity.PATH, path);
            getApp().startActivity(intent);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == REQUEST_NEW_PITCH) {
                mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);
                mPitchPlayButton.setVisibility(View.VISIBLE);
            } else {
                if (requestCode == AppData.REQUEST_IMAGE_CAPTURE) {
                    Bitmap photo = (Bitmap) data.getExtras().get("data");
                    File file = AppHelper.saveBitmap(photo);
                    if (isAvatarSelector) {
                        setAvatarUri(Uri.fromFile(file));
                    } else {
                        cvUri = Uri.fromFile(file);
                    }
                } else if (requestCode == AppData.REQUEST_IMAGE_PICK) {
                    if (isAvatarSelector) {
                        setAvatarUri(data.getData());
                    } else {
                        String[] projection = { MediaStore.Images.Media.DATA };
                        Cursor cursor = getApp().getContentResolver().query(data.getData(), projection, null, null, null);
                        if(cursor != null) {
                            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
                            cursor.moveToFirst();
                            String path = cursor.getString(column_index);
                            cvUri = Uri.fromFile(new File(path));
                        }
                    }
                } else if (requestCode == AppData.REQUEST_GOOGLE_DRIVE || requestCode == AppData.REQUEST_DROPBOX) {
                    String path = (String) data.getExtras().get("path");
                    if (isAvatarSelector) {
                        setAvatarUri(Uri.fromFile(new File(path)));
                    } else {
                        cvUri = Uri.fromFile(new File(path));
                    }
                }
                if (cvUri != null) {
                    mCVCommentView.setText("CV added: save to upload.");
                    mCVClearButton.setVisibility(View.VISIBLE);
                }
            }
        }
    }

    @OnClick(R.id.job_seeker_save)
    void onSave() {
        if (!valid()) return;

        if (!mTickBox.isChecked()) {
            Popup popup = new Popup(getContext(), "You must check the box confirming the truth of the information you have provided.", true);
            popup.addGreyButton("Ok", null);
            popup.show();
            return;
        }

        final JobSeekerForUpdate jobSeekerForUpdate = new JobSeekerForUpdate();
        jobSeekerForUpdate.setActive(mActiveView.isChecked());
        jobSeekerForUpdate.setFirst_name(mFirstNameView.getText().toString().trim());
        jobSeekerForUpdate.setLast_name(mLastNameView.getText().toString().trim());
        jobSeekerForUpdate.setEmail_public(mEmailPublicView.isChecked());
        jobSeekerForUpdate.setTelephone(mTelephoneView.getText().toString().trim());
        jobSeekerForUpdate.setTelephone_public(mTelephonePublicView.isChecked());
        jobSeekerForUpdate.setMobile(mMobileView.getText().toString().trim());
        jobSeekerForUpdate.setMobile_public(mMobilePublicView.isChecked());
        if (!mAgeView.getText().toString().isEmpty()) {
            jobSeekerForUpdate.setAge(Integer.parseInt(mAgeView.getText().toString()));
        }
        jobSeekerForUpdate.setAge_public(mAgePublicView.isChecked());
        Integer sex = AppData.getIdByName(AppData.sexes, mSexView.getText().toString());
        if (sex != -1) {
            jobSeekerForUpdate.setSex(sex);
        }
        jobSeekerForUpdate.setSex_public(mSexPublicView.isChecked());
        Integer nationality = AppData.getIdByName(AppData.nationalities, mNationalityView.getText().toString());
        if (nationality != -1) {
            jobSeekerForUpdate.setNationality(nationality);
        }
        jobSeekerForUpdate.setNationality_public(mNationalityPublicView.isChecked());
        jobSeekerForUpdate.setDescription(mDescriptionView.getText().toString().trim());
        jobSeekerForUpdate.setHas_references(mHasReferencesView.isChecked());
        jobSeekerForUpdate.setTruth_confirmation(mTickBox.isChecked());
        jobSeekerForUpdate.setNational_insurance_number(mNationalNumberView.getText().toString());

        showLoading();

        new APITask(new APIAction() {
            @Override
            public void run() {

                File avatarFile = null;
                FileSystemResource avatarFileResource = null;

                if ( avatarUri != null) {
                    try {
                        File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                        if (!dir.exists()) {
                            dir.mkdirs();
                        }
                        String filename = "profile_" + avatarUri.getLastPathSegment();
                        avatarFile = new File(dir, filename);

                        // Copy imageUri content to temp file
                        InputStream in = getApp().getContentResolver().openInputStream(avatarUri);
                        FileOutputStream out = new FileOutputStream(avatarFile);
                        byte[] buf = new byte[1024];
                        int len;
                        while ((len = in.read(buf)) > 0)
                            out.write(buf, 0, len);
                        out.close();
                        in.close();

                        avatarFileResource = new FileSystemResource(avatarFile);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                File cvFile = null;
                FileSystemResource cvFileResource = null;

                if (cvUri != null) {
                    try {
                        File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                        if (!dir.exists()) {
                            dir.mkdirs();
                        }
                        String filename = "cv_" + cvUri.getLastPathSegment();
                        cvFile = new File(dir, filename);

                        // Copy imageUri content to temp file
                        InputStream in = getApp().getContentResolver().openInputStream(cvUri);
                        FileOutputStream out = new FileOutputStream(cvFile);
                        byte[] buf = new byte[1024];
                        int len;
                        while ((len = in.read(buf)) > 0)
                            out.write(buf, 0, len);
                        out.close();
                        in.close();

                        cvFileResource = new FileSystemResource(cvFile);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                AppData.jobSeeker = MJPApi.shared().updateJobSeeker(AppData.user.getJob_seeker(), jobSeekerForUpdate, avatarFileResource, cvFileResource, removedCV);

                if (avatarFile != null) {
                    avatarFile.delete();
                }
                if (cvFile != null) {
                    cvFile.delete();
                }
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

    void uploadPitch() {

        new APITask(new APIAction() {
            @Override
            public void run() {
                mPitch = MJPApi.shared().create(Pitch.class, new Pitch());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                AWSPitchUploader pitchUploader = new AWSPitchUploader(getApp(), "pitches");
                PitchUpload upload = pitchUploader.upload(new File(mVideoPath), mPitch);
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
                                    public void run() {
                                        AppData.jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                                    }
                                }).addListener(new APITaskListener() {
                                    @Override
                                    public void onSuccess() {
                                        mPitch = AppData.jobSeeker.getPitch();
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
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    void saveCompleted() {
        if (AppData.user.getJob_seeker() == null) {
            AppData.user.setJob_seeker(AppData.jobSeeker.getId());
            getApp().setRootFragement(R.id.menu_job_profile);
        } else {
            getApp().popFragment();
        }
    }

    void setAvatarUri(Uri uri) {
        String path;
        String[] projection = { MediaStore.Images.Media.DATA };
        Cursor cursor = MainActivity.shared().getContentResolver().query(uri, projection, null, null, null);
        if(cursor != null) {
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
            cursor.moveToFirst();
            path = cursor.getString(column_index);
        } else {
            path = uri.getPath();
        }

        try {
            ExifInterface exif = new ExifInterface(path);
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);
            Matrix matrix = new Matrix();
            switch (orientation) {
                case ExifInterface.ORIENTATION_ROTATE_90:
                    matrix.postRotate(90);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_180:
                    matrix.postRotate(180);
                    break;
                case ExifInterface.ORIENTATION_ROTATE_270:
                    matrix.postRotate(270);
                    break;
            }
            Bitmap bitmap = BitmapFactory.decodeFile(path);
            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            mAvatarView.setImageBitmap(bitmap);
            avatarUri = uri;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
