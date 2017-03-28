package com.myjobpitch.api.data;

import java.util.Date;

/**
 * Created by Jamie on 02/06/2015.
 */
public class MessageLocal extends Message {
    public void setContent(String content) {
        this.content = content;
    }

    public void setApplication(Integer application) {
        this.application = application;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    public void setFrom_role(Integer from_role) {
        this.from_role = from_role;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }

    public void setSystem(Boolean system) {
        this.system = system;
    }
}
