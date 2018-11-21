package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

public class HRJob extends MJPObjectWithDates {
    private String title;
    private String description;
    private Integer location;

    public String getTitle() {
        return title;
    }
    public String getDescription() {
        return description;
    }
    public Integer getLocation() {
        return location;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public void setLocation(Integer location) {
        this.location = location;
    }

}
