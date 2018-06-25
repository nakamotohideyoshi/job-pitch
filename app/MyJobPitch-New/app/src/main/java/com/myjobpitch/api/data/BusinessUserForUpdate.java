package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.List;

public class BusinessUserForUpdate extends MJPAPIObject {

    private List<Integer> locations;

    public void setLocations(List<Integer> locations) {
        this.locations = locations;
    }

}
