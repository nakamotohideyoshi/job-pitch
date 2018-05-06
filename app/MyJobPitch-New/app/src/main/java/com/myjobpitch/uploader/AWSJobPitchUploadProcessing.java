package com.myjobpitch.uploader;

import android.os.AsyncTask;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobPitch;

import org.springframework.web.client.HttpClientErrorException;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AWSJobPitchUploadProcessing extends AWSJobPitchUploadBase {

    private boolean mCancelled = false;
    private boolean mStopped = false;

    public AWSJobPitchUploadProcessing(JobPitch pitch) {
        super(pitch);
    }

    @Override
    public void setPitchUploadListener(final PitchUploadListener listener) {
        super.setPitchUploadListener(listener);
        listener.onStateChange(PitchUpload.PROCESSING);
        AsyncTask<Void, Void, Void> pollPitch = new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                int iterations = 0;
                while (true) {
                    synchronized (this) {
                        if (mCancelled || mStopped)
                            return null;
                    }
                    if (iterations % 5 == 0) {
                        try {
                            JobPitch update = MJPApi.shared().get(JobPitch.class, pitch.getId());
                            if (update.getVideo() != null)
                                return null;
                        } catch (MJPApiException e) {

                        } catch (HttpClientErrorException e) {
                            mStopped = true;
                            return null;
                        }
                    }
                    try {
                        Thread.sleep(1000);
                    } catch (InterruptedException e) {}
                    iterations++;
                }
            }

            @Override
            protected void onPostExecute(Void result) {
                if (!mStopped && !mCancelled)
                    listener.onStateChange(PitchUpload.COMPLETE);
            }
        };
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
