package com.myjobpitch.activities;

import android.app.Activity;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.api.MJPApi;

public class MJPActivityDelegate implements MJPActivityInterface {
    private final Activity mActivity;

    public MJPActivityDelegate(Activity mContext) {
        this.mActivity = mContext;
    }

    @Override
    public MJPApi getApi() {
        return getMJPApplication().getApi();
    }

    @Override
    public MJPApplication getMJPApplication() {
        return (MJPApplication) mActivity.getApplication();
    }
}
