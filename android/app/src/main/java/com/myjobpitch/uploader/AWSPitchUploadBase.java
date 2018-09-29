package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferListener;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.myjobpitch.api.data.Pitch;

public abstract class AWSPitchUploadBase implements PitchUpload, TransferListener {

    protected Pitch pitch;
    protected PitchUploadListener listener;

    public AWSPitchUploadBase(Pitch pitch) {
        this.pitch = pitch;
    }

    @Override
    public void setPitchUploadListener(PitchUploadListener listener) {
        this.listener = listener;
    }

    @Override
    public synchronized void onStateChanged(int id, TransferState state) {
        if (state.equals(TransferState.COMPLETED))
            new AWSPitchUploadProcessing(pitch).setPitchUploadListener(listener);
    }

    @Override
    public synchronized void onProgressChanged(int id, long bytesCurrent, long bytesTotal) {
        listener.onProgress(bytesCurrent, bytesTotal);
    }

    @Override
    public synchronized void onError(int id, Exception ex) {
        listener.onError("Error during upload!");
    }
}
