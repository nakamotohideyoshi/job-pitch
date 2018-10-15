package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Location extends MJPObjectWithDates {
    private Integer business;
    private List<Integer> jobs;
    private Integer active_job_count;
    private String name;
    private String description;
    private String email;
    private String telephone;
    private String mobile;
    private boolean email_public;
    private boolean mobile_public;
    private boolean telephone_public;
    private Double longitude;
    private Double latitude;
    private String place_name;
    private String place_id;
    private String country;
    private String region;
    private String city;
    private String street;
    private String street_number;
    private String postcode;
    private List<Image> images;

    private Business business_data;

    public Integer getBusiness() {
        return business;
    }

    public List<Integer> getJobs() {
        return jobs;
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

    public boolean getEmail_public() {
        return email_public;
    }

    public String getMobile() {
        return mobile;
    }

    public boolean getMobile_public() {
        return mobile_public;
    }

    public String getTelephone() {
        return telephone;
    }

    public boolean getTelephone_public() {
        return telephone_public;
    }

    public void setBusiness(Integer business) {
        this.business = business;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public void setEmail_public(boolean emailPublic) {
        this.email_public = emailPublic;
    }

    public void setTelephone_public(boolean telephone_public) {
        this.telephone_public = telephone_public;
    }

    public void setMobile_public(boolean mobile_public) {
        this.mobile_public = mobile_public;
    }

    public String getPlace_name() {
        return place_name;
    }

    public void setPlace_name(String place_name) {
        this.place_name = place_name;
    }

    public void setPlace_id(String place_id) {
        this.place_id = place_id;
    }

    public String getPlace_id() {
        return place_id;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCountry() {
        return country;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getRegion() {
        return region;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCity() {
        return city;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet_number(String street_number) {
        this.street_number = street_number;
    }

    public String getStreet_number() {
        return street_number;
    }

    public void setPostcode(String postcode) {
        this.postcode = postcode;
    }

    public String getPostcode() {
        return postcode;
    }

    public List<Image> getImages() {
        return images;
    }

    public Business getBusiness_data() {
        return business_data;
    }

    public Integer getActive_job_count() {
        return active_job_count;
    }

}
