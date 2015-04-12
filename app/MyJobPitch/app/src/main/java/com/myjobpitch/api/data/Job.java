package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;

public class Job extends MJPAPIObject {
    private String title;
    private String description;
    private Integer sector;
    private Integer location;
    private Integer contract;
    private Integer hours;
    private Integer status;
    private Date created;
    private Date updated;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getSector() {
        return sector;
    }

    public Integer getLocation() {
        return location;
    }

    public Integer getContract() {
        return contract;
    }

    public Integer getHours() {
        return hours;
    }

    public Integer getStatus() {
        return status;
    }

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSector(Integer sector) {
        this.sector = sector;
    }

    public void setLocation(Integer location) {
        this.location = location;
    }

    public void setContract(Integer contract) {
        this.contract = contract;
    }

    public void setHours(Integer hours) {
        this.hours = hours;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}
