package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.myjobpitch.api.MJPAPIObject;

public class JobPitch extends MJPAPIObject {
    private String token;
    private String video;
    private String thumbnail;

    @JsonProperty("job")
    private Integer job;

    public Integer getJob() {
        return job;
    }

    public void setJob(int job) {
        this.job = job;
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
