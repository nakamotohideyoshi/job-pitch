package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPObjectWithDates;

public class EmployeeBase extends MJPObjectWithDates {

    protected String first_name;
    protected String last_name;
    protected String email;
    protected String telephone;
    protected Integer sex;
    protected String birthday;
    protected Integer nationality;
    protected String national_insurance_number;
    protected Integer business;
    protected String profile_image;
    protected String profile_thumb;
    
    public String getFirst_name() {
        return first_name;
    }
    public String getLast_name() {
        return last_name;
    }
    public String getEmail() {
        return email;
    }
    public String getTelephone() {
        return telephone;
    }
    public Integer getSex() {
        return sex;
    }
    public String getBirthday() {
        return birthday;
    }
    public Integer getNationality() {
        return nationality;
    }
    public String getNational_insurance_number() {
        return national_insurance_number;
    }
    public Integer getBusiness() {
        return business;
    }
    public String getProfile_image() {
        return profile_image;
    }
    public String getProfile_thumb() {
        return profile_thumb;
    }

}
