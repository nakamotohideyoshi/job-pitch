package com.myjobpitch.uploader;

/**
 * Created by jcockburn on 11/09/15.
 */
public interface PitchUploadListener {
    void onStateChange(int state);
    void onProgress(double current, long total);
    void onError(String message);
}
