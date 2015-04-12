package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPAPIObject;

import java.util.Collections;
import java.util.Date;
import java.util.List;

@JsonIgnoreProperties({"user"})
public class JobSeeker extends MJPAPIObject {
    private String first_name;
    private String last_name;
    private String email;
    private String telephone;
    private String mobile;
    private Date created;
    private Date updated;
    private boolean email_public;
    private boolean mobile_public;
    private boolean telephone_public;
    private Integer age;
    private Integer sex;
    private Integer nationality;
    private boolean sex_public;
    private boolean nationality_public;
    private boolean age_public;
    private Integer profile;
    private List<Experience> experience;

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

    public Integer getAge() {
        return age;
    }

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
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

    public void setAge(Integer age) {
        this.age = age;
    }

    public Integer getSex() {
        return sex;
    }

    public Integer getNationality() {
        return nationality;
    }

    public boolean getSex_public() {
        return sex_public;
    }

    public boolean getNationality_public() {
        return nationality_public;
    }

    public boolean getAge_public() {
        return age_public;
    }

    public void setSex(Integer sex) {
        this.sex = sex;
    }

    public void setNationality(Integer nationality) {
        this.nationality = nationality;
    }

    public void setSex_public(boolean sex_public) {
        this.sex_public = sex_public;
    }

    public void setNationality_public(boolean nationality_public) {
        this.nationality_public = nationality_public;
    }

    public void setAge_public(boolean age_public) {
        this.age_public = age_public;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }

    public String getLast_name() {
        return last_name;
    }

    public void setFirst_name(String first_name) {
        this.first_name = first_name;
    }

    public String getFirst_name() {
        return first_name;
    }

    public Integer getProfile() {
        return profile;
    }

    public List<Experience> getExperience() {
        Collections.sort(experience);
        return experience;
    }
}
