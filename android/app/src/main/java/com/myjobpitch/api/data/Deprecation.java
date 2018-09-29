package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

public class Deprecation extends MJPAPIObject {
    protected String platform;
    protected String warning;
    protected String error;

    public String getPlatform() {
        return platform;
    }

    public String getWarning() {
        return warning;
    }

    public String getError() { return error; }


}
