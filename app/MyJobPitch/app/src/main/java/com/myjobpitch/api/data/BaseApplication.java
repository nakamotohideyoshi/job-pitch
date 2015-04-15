package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

/**
 * Created by Jamie on 15/04/2015.
 */
public abstract class BaseApplication extends MJPObjectWithDates {
    Integer job;
    boolean shortlisted;
    Integer status;

    public Integer getJob() {
        return job;
    }

    public boolean getShortlisted() {
        return shortlisted;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }
}
