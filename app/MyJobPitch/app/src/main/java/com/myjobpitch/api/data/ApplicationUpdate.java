package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationUpdate extends MJPAPIObject {
    private Integer status;
    private Boolean shortlisted;

    public  ApplicationUpdate() {}

    public ApplicationUpdate(Application application) {
        this.id = application.getId();
        this.status = application.getStatus();
        this.shortlisted = application.getShortlisted();
    }

    public Integer getStatus() {
        return status;
    }

    public Boolean getShortlisted() {
        return shortlisted;
    }
}
