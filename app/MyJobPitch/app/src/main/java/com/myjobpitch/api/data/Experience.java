package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

public class Experience extends MJPAPIObject implements Comparable<Experience> {
    private String details;
    private Integer order;
    private Integer job_seeker;

    public String getDetails() {
        return details;
    }

    public Integer getJob_seeker() {
        return job_seeker;
    }

    public Integer getOrder() {
        return order;
    }

    public int compareTo(Experience o) {
        return order - o.order;
    }
}
