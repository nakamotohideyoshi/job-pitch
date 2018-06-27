package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

/**
 * Created by Kei on 26/06/2018.
 */
public class Interview extends MJPAPIObject {
    private Integer application;
    private Date at;
    private List<InterviewMessage> messages;
    private String notes;
    private String feedback;
    private Date cancelled;
    private Integer cancelled_by;

    public Integer getApplication() {
        return application;
    }

    public Date getAt() {
        return at;
    }

    public List<InterviewMessage> getMessages() {
        return messages;
    }

    public String getNotes() {
        return notes;
    }

    public String getFeedback() {
        return feedback;
    }

    public Date getCancelled() {
        return cancelled;
    }

    public Integer getCancelled_by() {
        return cancelled_by;
    }
}


