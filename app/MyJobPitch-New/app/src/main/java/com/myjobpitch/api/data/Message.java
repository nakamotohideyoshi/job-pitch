package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;

/**
 * Created by Jamie on 27/05/2015.
 */
public class Message extends MJPAPIObject {
    protected Integer application;
    protected Boolean system;
    protected Integer from_role;
    protected String content;
    protected Date created;
    protected Boolean read;

    public Integer getApplication() {
        return application;
    }

    public Boolean getSystem() {
        return system;
    }

    public Integer getFrom_role() {
        return from_role;
    }

    public String getContent() {
        return content;
    }

    public Date getCreated() {
        return created;
    }

    public Boolean getRead() {
        return read;
    }
}
