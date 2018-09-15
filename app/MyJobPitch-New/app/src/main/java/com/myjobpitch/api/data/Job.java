package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

public class Job extends MJPObjectWithDates {
    private String title;
    private String description;
    private Integer sector;
    private Integer location;
    private Integer contract;
    private Integer hours;
    private Integer status;

    private Location location_data;
    private List<Image> images;
    private List<JobPitch> videos;

    // Added in API V5
    private Boolean requires_pitch;
    private Boolean requires_cv;

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

    public Location getLocation_data() {
        return location_data;
    }

    public List<Image> getImages() {
        return images;
    }

    public List<JobPitch> getVideos() {
        return videos;
    }

    public JobPitch getPitch() {
        if (videos != null)
            for (JobPitch pitch : videos)
                if (pitch.getVideo() != null)
                    return pitch;
        return null;
    }

    public Boolean getRequires_cv() {
        return requires_cv;
    }

    public Boolean getRequires_pitch() {
        return requires_pitch;
    }

    public void setRequires_pitch(Boolean requires_pitch) {
        this.requires_pitch = requires_pitch;
    }

    public void setRequires_cv(Boolean requires_cv) {
        this.requires_cv = requires_cv;
    }
}
