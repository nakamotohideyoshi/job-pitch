package com.myjobpitch.uploader;

import com.myjobpitch.api.data.JobPitch;

import java.io.File;
import java.util.List;

public interface JobPitchUploader {
    PitchUpload upload(File file, int job);
    void getUploadInProgress(List<JobPitch> pitches, UploadInProgressCallback callback);
}
