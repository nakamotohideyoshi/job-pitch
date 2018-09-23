package com.myjobpitch.api.data;

import java.io.Serializable;

/**
 * Created by Kei on 15/09/2018.
 */
public class ExternalApplication implements Serializable {
    Integer job;
    boolean shortlisted = false;
    ExternalJobSeeker job_seeker;


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

    public ExternalJobSeeker getJob_seeker() {
        return job_seeker;
    }

    public void setJob_Seeker(ExternalJobSeeker job_seeker) { this.job_seeker = job_seeker; }


}