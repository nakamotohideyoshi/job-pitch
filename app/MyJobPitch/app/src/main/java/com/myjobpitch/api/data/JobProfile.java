package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

public class JobProfile extends MJPObjectWithDates {
    private Integer job_seeker;
    private List<Integer> sectors;
    private Integer contract;
    private Integer hours;
    private String place_name;
    private String place_id;
    private String postcode_lookup;
    private Double longitude;
    private Double latitude;
    private Integer search_radius;

    public List<Integer> getSectors() {
        return sectors;
    }

    public Integer getContract() {
        return contract;
    }

    public Integer getHours() {
        return hours;
    }

    public Integer getJob_seeker() {
        return job_seeker;
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

    public void setJob_seeker(Integer job_seeker) {
        this.job_seeker = job_seeker;
    }

    public String getPlace_name() {
        return place_name;
    }

    public void setPlace_name(String place_name) {
        this.place_name = place_name;
    }

    public String getPlace_id() {
        return place_id;
    }

    public void setPlace_id(String place_id) {
        this.place_id = place_id;
    }

    public String getPostcode_lookup() {
        return postcode_lookup;
    }

    public void setPostcode_lookup(String postcode_lookup) {
        this.postcode_lookup = postcode_lookup;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Integer getSearch_radius() {
        return search_radius;
    }

    public void setSearch_radius(Integer search_radius) {
        this.search_radius = search_radius;
    }
}
