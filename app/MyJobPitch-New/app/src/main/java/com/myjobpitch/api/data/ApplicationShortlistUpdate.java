package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationShortlistUpdate extends MJPAPIObject {
    private Boolean shortlisted;

    public ApplicationShortlistUpdate() {

    }

    public ApplicationShortlistUpdate(Application application) {
        this.id = application.getId();
        this.shortlisted = application.getShortlisted();
    }

    // Required to exist for RestTemplate to serialize value
    public Boolean getShortlisted() {
        return shortlisted;
    }
}
