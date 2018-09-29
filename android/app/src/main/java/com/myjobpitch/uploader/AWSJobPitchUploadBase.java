package com.myjobpitch.uploader;

import com.amazonaws.mobileconnectors.s3.transferutility.TransferListener;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.myjobpitch.api.data.JobPitch;

public abstract class AWSJobPitchUploadBase implements PitchUpload, TransferListener {

    protected JobPitch pitch;
    protected PitchUploadListener listener;

    public AWSJobPitchUploadBase(JobPitch pitch) {
        this.pitch = pitch;
    }

    @Override
    public void setPitchUploadListener(PitchUploadListener listener) {
        this.listener = listener;
    }

    @Override
    public synchronized void onStateChanged(int id, TransferState state) {
        if (state.equals(TransferState.COMPLETED))
            new AWSJobPitchUploadProcessing(pitch).setPitchUploadListener(listener);
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
