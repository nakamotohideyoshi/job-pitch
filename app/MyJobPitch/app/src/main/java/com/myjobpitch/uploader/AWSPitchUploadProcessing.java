package com.myjobpitch.uploader;

import android.os.AsyncTask;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Pitch;

/**
 * Created by jcockburn on 11/09/15.
 */
public class AWSPitchUploadProcessing extends AWSPitchUploadBase {

    public AWSPitchUploadProcessing(MJPApi api, Pitch pitch) {
        super(api, pitch);
    }

    @Override
    public void setPitchUploadListener(final PitchUploadListener listener) {
        super.setPitchUploadListener(listener);
        listener.onStateChange(PitchUpload.PROCESSING);
        AsyncTask<Void, Void, Void> pollPitch = new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... params) {
                while (true) {
                    try {
                        Pitch update = api.get(Pitch.class, pitch.getId());
                        if (update.getVideo() != null)
                            return null;
                    } catch (MJPApiException e) {}
                    try {
                        Thread.sleep(15000);
                    } catch (InterruptedException e) {}
                }
            }

            @Override
            protected void onPostExecute(Void result) {
                listener.onStateChange(PitchUpload.COMPLETE);
            }
        };
        pollPitch.execute();
    }

    @Override
    public void start() {
        throw new RuntimeException("Cannot start an ongoing upload!");
    }
}
