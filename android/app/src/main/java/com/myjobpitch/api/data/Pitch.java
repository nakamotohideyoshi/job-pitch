package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.myjobpitch.api.MJPAPIObject;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Pitch extends MJPAPIObject {

    private String token;
    private String video;
    private String thumbnail;

    @JsonProperty("job_seeker")
    private Integer jobSeeker;

    public Integer getJobSeeker() {
        return jobSeeker;
    }

    public String getVideo() {
        return video;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public String getToken() {
        return token;
    }
}
