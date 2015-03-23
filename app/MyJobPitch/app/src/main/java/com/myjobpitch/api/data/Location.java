package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

public class Location extends MJPAPIObject {
    private int id;
    private Integer business;
    private String name;
    private String description;
    private String email;
    private String telephone;
    private String mobile;
    private Date created;
    private Date updated;

    public int getId() {
        return id;
    }

    public Integer getBusiness() {
        return business;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getEmail() {
        return email;
    }

    public String getMobile() {
        return mobile;
    }

    public String getTelephone() {
        return telephone;
    }

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
    }
}
