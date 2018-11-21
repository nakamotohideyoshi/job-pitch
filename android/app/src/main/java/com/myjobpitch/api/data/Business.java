package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Business extends MJPObjectWithDates {
    private String name;
    private List<Integer> users;
    private List<Integer> locations;
    private List<Image> images;
    private Integer  tokens;
    private Boolean restricted;
    private Boolean hr_access;

    public String getName() {
        return name;
    }
    public List<Integer> getUsers() {
        return users;
    }
    public List<Integer> getLocations() {
        return locations;
    }
    public List<Image> getImages() {
        return images;
    }
    public Integer getTokens() {
        return tokens;
    }
    public Boolean getRestricted() {
        return restricted;
    }
    public Boolean getHr_access() {
        return hr_access;
    }

    public void setName(String name) {
        this.name = name;
    }
}
