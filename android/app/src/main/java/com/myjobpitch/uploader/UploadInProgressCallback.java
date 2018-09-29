package com.myjobpitch.uploader;

/**
 * Created by jcockburn on 11/09/15.
 */
public interface UploadInProgressCallback {
    void uploadInProgress(PitchUpload upload);
    void noUploadInProgress();
    void error();
}
