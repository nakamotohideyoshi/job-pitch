package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;
import java.util.List;

@JsonIgnoreProperties({"user"})
public class ExternalJobseeker implements Serializable {
    private String first_name;
    private String last_name;
    private String email;
    private String telephone;
    private String mobile;
    private Integer age;
    private Integer sex;
    private String description;
    private Integer nationality;
    private String national_insurance_number;

    public String getFirst_name() {
        return first_name;
    }
    public void setFirst_name(String first_name) {
        this.first_name = first_name;
    }
    public String getLast_name() {
        return last_name;
    }
    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public String getTelephone() {
        return telephone;
    }
    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
    public String getMobile() {
        return mobile;
    }
    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
    public Integer getAge() {
        return age;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public Integer getSex() {
        return sex;
    }
    public void setSex(Integer sex) {
        this.sex = sex;
    }
    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public Integer getNationality() {
        return nationality;
    }
    public void setNationality(Integer nationality) {
        this.nationality = nationality;
    }
    public String getNational_insurance_number() {
        return national_insurance_number;
    }
    public void setNational_insurance_number(String number) {
        this.national_insurance_number = number;
    }
}
