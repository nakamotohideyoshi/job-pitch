package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.activities.CameraActivity;
import com.myjobpitch.activities.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationForCreationWithPitch;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.SpecificPitchForCreation;
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

public class JobApplyFragment extends FormFragment {

    @BindView(R.id.image_preview)
    ImageView mImagePreview;

    @BindView(R.id.play_icon)
    ImageView mPlayIcon;

    public interface Callback {
        void completed();
    }

    public Job job;
    public Callback callback;

    String mVideoPath;
    Pitch mPitch;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_apply, container, false);
        ButterKnife.bind(this, view);

        title = "Apply Job";

        mPitch = AppData.jobSeeker.getPitch();
        if (mPitch != null) {
            AppHelper.loadImage(mPitch.getThumbnail(), mImagePreview);
            mPlayIcon.setVisibility(View.VISIBLE);
        } else {
            mPlayIcon.setVisibility(View.INVISIBLE);
        }
        return  view;
    }

    @OnClick(R.id.image_preview)
    void onPlay() {
        String path = mVideoPath;
        if (path == null && mPitch != null) {
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
        getActivity().startActivityForResult(intent, 1);
    }

    void createApplication(final Integer pitchId) {
        new APITask(new APIAction() {
            @Override
            public void run() {
                ApplicationForCreation applicationForCreation = pitchId == null ? new ApplicationForCreation() : new ApplicationForCreationWithPitch(pitchId);
                applicationForCreation.setJob(job.getId());
                applicationForCreation.setJob_seeker(AppData.jobSeeker.getId());
                MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                getApp().popFragment();
                callback.completed();
                return;
            }

            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.apply_button)
    void onApply() {

        showLoading();

        if (mVideoPath == null) {
            createApplication(null);
            return;
        }

        new APITask(new APIAction() {
            @Override
            public void run() {
                SpecificPitchForCreation specificPitch = new SpecificPitchForCreation();
                specificPitch.setJob_seeker(AppData.jobSeeker.getId());
                mPitch = MJPApi.shared().createSpecificPitch(specificPitch);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                AWSPitchUploader pitchUploader = new AWSPitchUploader(getApp(), "application-pitches");
                PitchUpload upload = pitchUploader.upload(new File(mVideoPath), mPitch);
                upload.setPitchUploadListener(new PitchUploadListener() {
                    @Override
                    public void onStateChange(int state) {
                        switch (state) {
                            case PitchUpload.UPLOADING:
                                loading.setType(Loading.Type.PROGRESS);
                                break;
                            case PitchUpload.PROCESSING:
                                loading.setType(Loading.Type.SPIN);
                                Log.d("upload", "Processing...");
                                break;
                            case PitchUpload.COMPLETE:
                                Log.d("upload", "COMPLETE");
                                createApplication(mPitch.getId());
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
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);

            mPlayIcon.setVisibility(View.VISIBLE);
            Bitmap previewBitmap = ThumbnailUtils.createVideoThumbnail(mVideoPath, MediaStore.Images.Thumbnails.FULL_SCREEN_KIND);
            mImagePreview.setImageBitmap(previewBitmap);
        }
    }

}
