package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

public class Business extends MJPObjectWithDates {
    private String name;
    private List<Integer> users;
    private List<Integer> locations;
    private List<Image> images;
    private Integer  tokens;

    public String getName() {
        return name;
    }

    public List<Integer> getUsers() {
        return users;
    }

    public List<Integer> getLocations() {
        return locations;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Image> getImages() {
        return images;
    }

    public Integer getTokens() {
        return tokens;
    }
}
