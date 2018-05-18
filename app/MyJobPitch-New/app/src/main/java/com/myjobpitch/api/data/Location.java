package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

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
    private String place_name;
    private String place_id;
    private String postcode_lookup;
    private Double longitude;
    private Double latitude;
    private String address;
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

    public String getPostcode_lookup() {
        return postcode_lookup;
    }

    public void setPostcode_lookup(String postcode_lookup) {
        this.postcode_lookup = postcode_lookup;
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

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddress() {
        return address;
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

    public Image getLogo() {
        if (images != null && images.size() > 0) {
            return images.get(0);
        }
        return business_data.getLogo();
    }
}
