package com.myjobpitch.api.auth;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class User extends MJPAPIObject {
	private String username;
	private String email;
	private String first_name;
	private String last_name;
    private List<Integer> businesses;
    private Integer job_seeker;

    public String getUsername() {
		return username;
	}

	public String getEmail() {
		return email;
	}
	
	public String getFirst_name() {
		return first_name;
	}
	
	public String getLast_name() {
		return last_name;
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
}
