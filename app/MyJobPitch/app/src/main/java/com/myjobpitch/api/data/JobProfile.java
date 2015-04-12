package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

public class JobProfile extends MJPAPIObject {
    private List<Integer> sectors;
    private Integer contract;
    private Integer hours;
    private Date created;
    private Date updated;

    public List<Integer> getSectors() {
        return sectors;
    }

    public Integer getContract() {
        return contract;
    }

    public Integer getHours() {
        return hours;
    }

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
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
}
