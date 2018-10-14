package com.myjobpitch.uploader;

import com.myjobpitch.api.data.Pitch;

import java.io.File;
import java.util.List;

public interface PitchUploader {
    PitchUpload upload(File file, Pitch pitch);
    void getUploadInProgress(List<Pitch> pitches, UploadInProgressCallback callback);
}
