package com.myjobpitch.api.data;

public class HREmployee extends EmployeeBase {

    protected Integer job;

    public Integer getJob() {
        return job;
    }

    public void setFirst_name(String first_name) {
        this.first_name = first_name;
    }
    public void setLast_name(String last_name) {
        this.last_name = last_name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
    public void setSex(Integer sex) {
        this.sex = sex;
    }
    public void setBirthday(String birthday) {
        this.birthday = birthday;
    }
    public void setNationality(Integer nationality) {
        this.nationality = nationality;
    }
    public void setNational_insurance_number(String number) {
        this.national_insurance_number = number;
    }
    public void setBusiness(Integer business) {
        this.business = business;
    }
    public void setJob(Integer job) {
        this.job = job;
    }
}
