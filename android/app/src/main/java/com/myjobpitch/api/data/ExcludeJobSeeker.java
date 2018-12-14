package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

public class ExcludeJobSeeker extends MJPAPIObject {
    private Integer job_seeker;
    private Integer job;

    public Integer getJob() {
        return job;
    }
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
