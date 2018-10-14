package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Pitch;

import java.io.File;

public class AWSPitchUpload extends AWSPitchUploadBase {
    private final TransferUtility transferUtility;
    private final File file;
    private TransferObserver mObserver;
    private boolean mCancelled = false;

    public AWSPitchUpload(TransferUtility transferUtility, File file, Pitch pitch, String endpoint) {
        super(pitch, endpoint);
        this.transferUtility = transferUtility;
        this.file = file;
    }

    @Override
    public void start() {
        mObserver = transferUtility.upload(
                "mjp-android-uploads",
                String.format("%s/%s.%s.%s.%s", MJPApi.shared().getApiRoot().replace("/", ""), pitch.getToken(), pitch.getId(), endpoint, file.getName()),
                file
        );
        mObserver.setTransferListener(AWSPitchUpload.this);
        listener.onStateChange(PitchUpload.UPLOADING);
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
