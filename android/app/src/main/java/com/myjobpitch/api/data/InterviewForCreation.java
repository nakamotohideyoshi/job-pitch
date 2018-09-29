package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

/**
 * Created by Kei on 30/06/2018.
 */
public class InterviewForCreation extends MJPAPIObject {
    private String invitation;
    private String at;
    private Integer application;
    private String notes;
    private String feedback;
    private List<Message> messages;
    private Date cancelled;
    private Integer cancelled_by;
    private String status;

    public List<Message> getMessages() {
        return messages;
    }

    public void setApplication(Integer application) {
        this.application = application;
    }

    public Integer getApplication() {
        return application;
    }

    public void setAt(String at) {
        this.at = at;
    }

    public String getAt() {
        return at;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setInvitation(String invitation) {
        this.invitation = invitation;
    }

    public String getInvitation() {
        return invitation;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
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


