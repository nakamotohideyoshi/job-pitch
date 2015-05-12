package com.myjobpitch.activities;

import android.annotation.TargetApi;
import android.os.Build;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.api.MJPApi;

public abstract class MJPProgressActionBarActivity extends MJPActionBarActivity implements MJPProgressActivityInterface {
    private final MJPProgressActivityDelegate progressActivityDelegate = new MJPProgressActivityDelegate(this, this);

    @Override
    protected MJPActivityDelegate createDelegate() {
        return progressActivityDelegate;
    }

    @Override
    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(boolean show) {
        progressActivityDelegate.showProgress(show);
    }

    @Override
    public MJPApi getApi() {
        return progressActivityDelegate.getApi();
    }

    @Override
    public MJPApplication getMJPApplication() {
        return progressActivityDelegate.getMJPApplication();
    }
}
