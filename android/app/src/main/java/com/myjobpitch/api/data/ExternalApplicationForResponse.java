package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.io.Serializable;

/**
 * Created by Kei on 15/09/2018.
 */
public class ExternalApplicationForResponse extends MJPAPIObject {
    Integer job;
    boolean shortlisted = false;
    Integer job_seeker;


    public Integer getJob() {
        return job;
    }

    public void setJob(Integer job) { this.job = job; }

    public boolean getShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }

    public Integer getJob_seeker() {
        return job_seeker;
    }

    public void setJob_Seeker(Integer job_seeker) { this.job_seeker = job_seeker; }


}
