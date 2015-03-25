package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;

public class Location extends MJPAPIObject {
    private Integer id;
    private Integer business;
    private String name;
    private String description;
    private String email;
    private String telephone;
    private String mobile;
    private Date created;
    private Date updated;
    private boolean email_public;
    private boolean mobile_public;
    private boolean telephone_public;
    private boolean mobil_public;

    public Integer getId() {
        return id;
    }

    public Integer getBusiness() {
        return business;
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

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
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

    public void setMobil_public(boolean mobil_public) {
        this.mobil_public = mobil_public;
    }
}
