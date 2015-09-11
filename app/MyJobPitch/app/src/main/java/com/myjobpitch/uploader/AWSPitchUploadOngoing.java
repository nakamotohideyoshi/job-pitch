package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferObserver;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Pitch;

/**
 * Created by jcockburn on 11/09/15.
 */
public class AWSPitchUploadOngoing extends AWSPitchUploadBase {

    private final TransferObserver transferObserver;

    public AWSPitchUploadOngoing(MJPApi api, Pitch pitch, TransferObserver transferObserver) {
        super(api, pitch);
        this.transferObserver = transferObserver;
    }

    @Override
    public void setPitchUploadListener(PitchUploadListener listener) {
        super.setPitchUploadListener(listener);
        synchronized (this) {
            listener.onStateChange(PitchUpload.UPLOADING);
            transferObserver.setTransferListener(this);
            int id = transferObserver.getId();
            TransferState state = transferObserver.getState();
            onStateChanged(id, state);
            onProgressChanged(id, transferObserver.getBytesTransferred(), transferObserver.getBytesTotal());
        }
    }

    @Override
    public void start() {
        throw new RuntimeException("Cannot start an ongoing upload!");
    }
}
