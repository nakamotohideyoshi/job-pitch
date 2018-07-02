package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

/**
 * Created by Kei on 30/06/2018.
 */
public class InterviewForUpdate extends MJPAPIObject {

    private String invitation;
    private Date at;
    private Integer application;
    private String notes;
    private String feedback;

    public void setApplication(Integer application) {
        this.application = application;
    }

    public Integer getApplication() {
        return application;
    }

    public void setAt(Date at) {
        this.at = at;
    }

    public Date getAt() {
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

    public void setNotes(String note) {
        this.notes = notes;
    }

    public String getNotes() {
        return notes;
    }
}


