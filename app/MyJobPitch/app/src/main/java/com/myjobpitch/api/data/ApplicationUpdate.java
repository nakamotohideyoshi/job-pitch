package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationUpdate extends MJPAPIObject {
    private Boolean shortlisted;

    public ApplicationUpdate(Application application) {
        this.id = application.getId();
        this.shortlisted = application.getShortlisted();
    }
}
