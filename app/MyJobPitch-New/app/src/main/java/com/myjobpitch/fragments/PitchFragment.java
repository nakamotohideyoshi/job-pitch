package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.os.Bundle;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;

import com.kaopiz.kprogresshud.KProgressHUD;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;

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

        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                AppData.existProfile = jobSeeker.getProfile() != null;
                mPitch = jobSeeker.getPitch();
            }
            @Override
            protected void onSuccess() {
                updateInterface();
            }
        };

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

    @OnClick(R.id.upload_button)
    void onUpload() {

        Loading.show("");
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
                        new APITask(null, PitchFragment.this) {
                            @Override
                            protected void runAPI() throws MJPApiException {
                                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                                mPitch = jobSeeker.getPitch();
                                mVideoPath = null;
                            }
                            @Override
                            protected void onSuccess() {
                                Loading.hide();
                                updateInterface();
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

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);
            updateInterface();
        }
    }

}
