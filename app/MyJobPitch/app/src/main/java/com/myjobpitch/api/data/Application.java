package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

public class Application extends MJPObjectWithDates {
    Integer job;
    Integer job_seeker;
    Integer created_by;
    Integer deleted_by;
    boolean shortlisted;
    Integer status;

    public Integer getJob() {
        return job;
    }

    public Integer getJob_seeker() {
        return job_seeker;
    }

    public Integer getCreated_by() {
        return created_by;
    }

    public Integer getDeleted_by() {
        return deleted_by;
    }

    public boolean getShortlisted() {
        return shortlisted;
    }

    public Integer getStatus() {
        return status;
    }

    public void setJob(Integer job) {
        this.job = job;
    }

    public void setJob_seeker(Integer job_seeker) {
        this.job_seeker = job_seeker;
    }

    public void setCreated_by(Integer created_by) {
        this.created_by = created_by;
    }

    public void setDeleted_by(Integer deleted_by) {
        this.deleted_by = deleted_by;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public void setShortlisted(boolean shortlisted) {
        this.shortlisted = shortlisted;
    }
}
