package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import java.io.File;

public class AWSPitchUpload extends AWSPitchUploadBase {
    private final File file;
    private final TransferUtility transferUtility;
    private TransferObserver mObserver;
    private boolean mCancelled = false;

    public AWSPitchUpload(TransferUtility transferUtility, File file) {
        super(null);
        this.transferUtility = transferUtility;
        this.file = file;
    }

    @Override
    public void start() {
        synchronized (this) {
            listener.onStateChange(PitchUpload.STARTING);
        }
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                pitch = MJPApi.shared().create(Pitch.class, new Pitch());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                synchronized (this) {
                    if (mCancelled)
                        return;
                    mObserver = transferUtility.upload(
                            "mjp-android-uploads",
                            String.format("%s/%s.%s.pitches.%s", MJPApi.shared().getApiRoot().replace("/", ""), pitch.getToken(), pitch.getId(), file.getName()),
                            file
                    );
                    mObserver.setTransferListener(AWSPitchUpload.this);
                    listener.onStateChange(PitchUpload.UPLOADING);
                }
            }

            @Override
            public void onError(JsonNode errors) {
                listener.onError(errors.asText());
            }
        }).execute();
    }

    @Override
    public synchronized void stop() {
        if (mObserver != null)
            mObserver.cleanTransferListener();
    }

    @Override
    public synchronized void cancel() {
        mCancelled = true;
        if (mObserver != null) {
            transferUtility.cancel(mObserver.getId());
        }
    }
}
