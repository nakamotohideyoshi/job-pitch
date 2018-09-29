package com.myjobpitch.api.auth;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class User extends MJPAPIObject {
	private String email;
    private List<Integer> businesses;
    private Integer job_seeker;
    private boolean can_create_businesses;

    public String getEmail() {
		return email;
	}

    public List<Integer> getBusinesses() {
        return businesses;
    }

    public Integer getJob_seeker() {
        return this.job_seeker;
    }

    public boolean getCan_create_businesses() {
        return this.can_create_businesses;
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
