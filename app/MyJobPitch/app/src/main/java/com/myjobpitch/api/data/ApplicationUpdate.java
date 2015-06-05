package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationUpdate extends MJPAPIObject {
    private Boolean shortlisted;

    public ApplicationUpdate() {

    }

    public ApplicationUpdate(Application application) {
        this.id = application.getId();
        this.shortlisted = application.getShortlisted();
    }

    // Required to exist for RestTemplate to serialize value
    public Boolean getShortlisted() {
        return shortlisted;
    }
}
