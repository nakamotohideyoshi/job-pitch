package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;

/**
 * Created by Jamie on 27/05/2015.
 */
public class Message extends MJPAPIObject {
    private Integer application;
    private Boolean system;
    private Integer from_role;
    private String content;
    private Date created;
    private Boolean read;

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
