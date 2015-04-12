package com.myjobpitch.activities;

import android.annotation.TargetApi;
import android.os.Build;
import android.view.View;

/**
 * Created by Jamie on 11/04/2015.
 */
public interface MJPProgressActivityInterface extends MJPActivityInterface {
    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    void showProgress(boolean show);

    View getMainView();

    View getProgressView();
}
