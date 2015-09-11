package com.myjobpitch.uploader;

import java.io.File;

public interface PitchUploader {
    PitchUpload upload(File file);
    void getUploadInProgress(UploadInProgressCallback callback);
}
