package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties({"created_by", "deleted_by"})
public class ApplicationForCreation extends BaseApplication {
    Integer job_seeker;

    public void setJob(Integer job) {
        this.job = job;
    }

    public Integer getJob_seeker() {
        return job_seeker;
    }

    public void setJob_seeker(Integer job_seeker) {
        this.job_seeker = job_seeker;
    }

}
