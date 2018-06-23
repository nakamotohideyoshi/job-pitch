package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class BusinessUser extends MJPAPIObject {
    private Integer user;
    private String email;
    private List<Integer> locations;
    private Integer business;

    public Integer getUser() {
        return user;
    }

    public String getEmail() {
        return email;
    }

    public List<Integer> getLocations() {
        return locations;
    }

    public Integer getBusiness() {
        return business;
    }
}
