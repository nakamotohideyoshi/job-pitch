package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

/**
 * Created by Kei on 26/06/2018.
 */
public class BaseInterview extends MJPAPIObject {
    private List<Message> messages;
    private String notes;
    private String feedback;

    public List<Message> getMessages() {
        return messages;
    }

    public String getNotes() {
        return notes;
    }

    public String getFeedback() {
        return feedback;
    }
}


