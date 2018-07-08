package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class BusinessUserForCreation extends MJPAPIObject {
    String email;
    List<Integer> locations;

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setLocations(List<Integer> locationList) {
        this.locations = locationList;
    }

    public List<Integer> getLocations() {
        return locations;
    }

}