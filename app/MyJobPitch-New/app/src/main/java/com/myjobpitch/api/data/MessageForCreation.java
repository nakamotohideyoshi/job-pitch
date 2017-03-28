package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

/**
 * Created by Jamie on 27/05/2015.
 */
public class MessageForCreation extends MJPAPIObject {
    private Integer application;
    private String content;

    public Integer getApplication() {
        return application;
    }

    public String getContent() {
        return content;
    }

    public void setApplication(Integer application) {
        this.application = application;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
