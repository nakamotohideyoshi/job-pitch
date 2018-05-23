package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.myjobpitch.api.MJPObjectWithDates;

import java.util.List;

@JsonIgnoreProperties({"user"})
public class JobSeeker extends MJPObjectWithDates {
    private boolean active;
    private String first_name;
    private String last_name;
    private String telephone;
    private String mobile;
    private String email;
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
    private List<Pitch> pitches;
    private String description;
    private String cv;
    private String national_insurance_number;
    private boolean has_national_insurance_number;

    private boolean has_references;

    private boolean truth_confirmation;

    public boolean getEmail_public() {
        return email_public;
    }

    public String getMobile() {
        return mobile;
    }

    public String getEmail() {
        return email;
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

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public List<Pitch> getPitches() {
        return pitches;
    }

    public Pitch getPitch() {
        if (pitches != null)
            for (Pitch pitch : pitches)
                if (pitch.getVideo() != null)
                    return pitch;
        return null;
    }

    public boolean hasPitch() {
        return getPitch() != null;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getCV() {
        return cv;
    }

    public void setCV(String cv) {
        this.cv = cv;
    }

    public boolean getHas_references() {
        return has_references;
    }

    public void setHas_references(boolean has_references) {
        this.has_references = has_references;
    }

    public boolean getTruth_confirmation() {
        return truth_confirmation;
    }

    public void setTruth_confirmation(boolean truth_confirmation) {
        this.truth_confirmation = truth_confirmation;
    }

    public String getNational_insurance_number() {
        return national_insurance_number;
    }

    public void setNational_insurance_number(String number) {
        this.national_insurance_number = number;
    }

    public boolean getHas_national_insurance_number() {
        return has_national_insurance_number;
    }

}
