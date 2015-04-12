package com.myjobpitch.activities;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.api.MJPApi;

public interface MJPActivityInterface {
    MJPApi getApi();
    MJPApplication getMJPApplication();
}
