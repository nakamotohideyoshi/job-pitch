package com.myjobpitch.api.auth;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class User extends MJPAPIObject {
	private String username;
    private List<Integer> businesses;
    private Integer job_seeker;

    public String getUsername() {
		return username;
	}

    public List<Integer> getBusinesses() {
        return businesses;
    }

    public Integer getJob_seeker() {
        return this.job_seeker;
    }

    public boolean isRecruiter() {
        return !this.businesses.isEmpty();
    }

    public boolean isJobSeeker() {
        return this.job_seeker != null;
    }

    public void setJob_seeker(Integer job_seeker) {
        this.job_seeker = job_seeker;
    }
}
