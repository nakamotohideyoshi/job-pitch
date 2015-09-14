package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Pitch;

public class AWSPitchUploadOngoing extends AWSPitchUploadBase {

    private final TransferObserver mObserver;
    private final TransferUtility mTransferUtility;
    private boolean mCancelled;

    public AWSPitchUploadOngoing(MJPApi api, Pitch pitch, TransferUtility transferUtility, TransferObserver transferObserver) {
        super(api, pitch);
        this.mTransferUtility = transferUtility;
        this.mObserver = transferObserver;
    }

    @Override
    public void setPitchUploadListener(PitchUploadListener listener) {
        super.setPitchUploadListener(listener);
        synchronized (this) {
            listener.onStateChange(PitchUpload.UPLOADING);
            mObserver.setTransferListener(this);
            int id = mObserver.getId();
            TransferState state = mObserver.getState();
            onStateChanged(id, state);
            onProgressChanged(id, mObserver.getBytesTransferred(), mObserver.getBytesTotal());
        }
    }

    @Override
    public void start() {
        throw new RuntimeException("Cannot start an ongoing upload!");
    }

    @Override
    public synchronized void stop() {
        mObserver.cleanTransferListener();
    }

    @Override
    public synchronized void cancel() {
        mCancelled = true;
        if (mObserver != null) {
            mTransferUtility.cancel(mObserver.getId());
        }
    }
}
