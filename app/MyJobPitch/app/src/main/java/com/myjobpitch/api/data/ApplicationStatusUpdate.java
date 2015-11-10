package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationStatusUpdate extends MJPAPIObject {
    private Integer status;

    public ApplicationStatusUpdate() {

    }

    public ApplicationStatusUpdate(Application application) {
        this.id = application.getId();
        this.status = application.getStatus();
    }

    // Required to exist for RestTemplate to serialize value
    public Integer getStatus() {
        return status;
    }
}
