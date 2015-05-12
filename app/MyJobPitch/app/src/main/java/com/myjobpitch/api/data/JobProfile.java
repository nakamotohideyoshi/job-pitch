package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

public class JobProfile extends MJPObjectWithDates {
    private Integer job_seeker;
    private List<Integer> sectors;
    private Integer contract;
    private Integer hours;

    public List<Integer> getSectors() {
        return sectors;
    }

    public Integer getContract() {
        return contract;
    }

    public Integer getHours() {
        return hours;
    }

    public Integer getJob_seeker() {
        return job_seeker;
    }

    public void setSectors(List<Integer> sectors) {
        this.sectors = sectors;
    }

    public void setContract(Integer contract) {
        this.contract = contract;
    }

    public void setHours(Integer hours) {
        this.hours = hours;
    }

    public void setJob_seeker(Integer job_seeker) {
        this.job_seeker = job_seeker;
    }
}
