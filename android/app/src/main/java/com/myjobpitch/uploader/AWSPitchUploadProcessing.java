package com.myjobpitch.uploader;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AWSPitchUploadProcessing extends AWSPitchUploadBase {

    private boolean mCancelled = false;
    private boolean mStopped = false;

    public AWSPitchUploadProcessing(Pitch pitch, String endpoint) {
        super(pitch, endpoint);
    }

    @Override
    public void setPitchUploadListener(final PitchUploadListener listener) {
        super.setPitchUploadListener(listener);
        listener.onStateChange(PitchUpload.PROCESSING);

        APITask pollPitch = new APITask(new APIAction() {
            @Override
            public void run() {
                while (true) {
                    synchronized (this) {
                        if (mCancelled || mStopped)
                            return;
                    }

                    try {
                        pitch = MJPApi.shared().getPitch(pitch.getId(), endpoint);
                        if (pitch.getVideo() != null)
                            return;
                    } catch (Exception e) {
                        mStopped = true;
                        return;
                    }

                    try {
                        Thread.sleep(2000);
                    } catch (InterruptedException e) {}
                }

            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                if (!mStopped && !mCancelled)
                    listener.onStateChange(PitchUpload.COMPLETE);
            }

            @Override
            public void onError(JsonNode errors) {
            }
        });

        ExecutorService executor = Executors.newSingleThreadExecutor();
        pollPitch.executeOnExecutor(executor);
        executor.shutdown();
    }

    @Override
    public void start() {
        throw new RuntimeException("Cannot start an ongoing upload!");
    }

    @Override
    public synchronized void stop() {
        mStopped = true;
    }

    @Override
    public synchronized void cancel() {
        mCancelled = true;
    }
}
