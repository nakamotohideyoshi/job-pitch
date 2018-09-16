package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
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

import java.io.File;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class PitchFragment extends BaseFragment {

    @BindView(R.id.image_preview)
    ImageView mImagePreview;

    @BindView(R.id.play_icon)
    ImageView mPlayIcon;

    @BindView(R.id.upload_button)
    Button mUploadButton;

    JobSeeker jobSeeker;
    Pitch mPitch;
    String mVideoPath;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_pitch, container, false);
        ButterKnife.bind(this, view);

        if (jobSeeker == null) {
            showLoading(view);
            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    AppData.existProfile = jobSeeker.getProfile() != null;
                    mPitch = jobSeeker.getPitch();
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    hideLoading();
                    updateInterface();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        } else {
            updateInterface();
        }

        addMenuItem(MENUGROUP1, 100, null, R.drawable.ic_help);

        return view;
    }

    void updateInterface() {
        mPlayIcon.setVisibility(View.VISIBLE);
        mUploadButton.setVisibility(View.INVISIBLE);

        if (mVideoPath != null) {
            mUploadButton.setVisibility(View.VISIBLE);
            Bitmap previewBitmap = ThumbnailUtils.createVideoThumbnail(mVideoPath, MediaStore.Images.Thumbnails.FULL_SCREEN_KIND);
            mImagePreview.setImageBitmap(previewBitmap);
        } else {
            if (mPitch != null) {
                AppHelper.loadImage(mPitch.getThumbnail(), mImagePreview);
                getApp().reloadMenu();
                getApp().setRootFragement(AppData.PAGE_FIND_JOB);
            } else {
                mPlayIcon.setVisibility(View.INVISIBLE);
            }
        }
    }

    @OnClick(R.id.image_preview)
    void onPlay() {
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

    @OnClick(R.id.new_record)
    void onNewRecord() {
        Intent intent = new Intent(getApp(), CameraActivity.class);
        startActivityForResult(intent, 10000);
    }

    @OnClick(R.id.example_video)
    void onPlayExamle() {
        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setData(Uri.parse("https://vimeo.com/255467562"));
        startActivity(intent);
    }

    @OnClick(R.id.upload_button)
    void onUpload() {

        showLoading();

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
                        Log.d("upload", "Processing...");
                        break;
                    case PitchUpload.COMPLETE:
                        Log.d("upload", "COMPLETE");
                        new APITask(new APIAction() {
                            @Override
                            public void run() throws MJPApiException {
                                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                                mPitch = jobSeeker.getPitch();
                                mVideoPath = null;
                            }
                        }).addListener(new APITaskListener() {
                            @Override
                            public void onSuccess() {
                                hideLoading();
                                updateInterface();
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
                final int complete = (int) (((float) current / total) * 100);
                Log.d("upload", "" + current + ", " + complete);
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
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);
            updateInterface();
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            WebviewFragment fragment = new WebviewFragment();
            fragment.title = "Record Pitch";
            fragment.mFilename = "pitch";
            getApp().pushFragment(fragment);
        }
    }

}
