package com.myjobpitch;

import android.app.Application;

import com.myjobpitch.api.MJPApi;

public class MjpApplication extends Application {
    private MJPApi api = new MJPApi();

    public MJPApi getApi() {
        return api;
    }
}
