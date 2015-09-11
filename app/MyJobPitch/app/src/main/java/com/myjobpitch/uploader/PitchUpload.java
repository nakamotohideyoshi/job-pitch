package com.myjobpitch.uploader;

/**
 * Created by jcockburn on 11/09/15.
 */
public interface PitchUpload {
    public final int STARTING = 1;
    public final int UPLOADING = 2;
    public final int PROCESSING = 3;
    public final int COMPLETE = 4;

    void setPitchUploadListener(PitchUploadListener listener);
    void start();
}
