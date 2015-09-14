package com.myjobpitch.uploader;

public interface PitchUpload {
    int STARTING = 1;
    int UPLOADING = 2;
    int PROCESSING = 3;
    int COMPLETE = 4;

    void setPitchUploadListener(PitchUploadListener listener);
    void start();
    void cancel();
    void stop();
}
