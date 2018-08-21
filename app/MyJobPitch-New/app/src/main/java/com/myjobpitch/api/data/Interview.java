package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

/**
 * Created by Kei on 26/06/2018.
 */
public class Interview extends ApplicationInterview {
    private Integer application;
    private Date cancelled;
    private Integer cancelled_by;
    private String status;

    public Integer getApplication() {
        return application;
    }

    public Date getCancelled() {
        return cancelled;
    }

    public Integer getCancelled_by() {
        return cancelled_by;
    }

    public String getStatus() {
        return status;
    }
}


