package com.myjobpitch;

import android.app.Application;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import java.util.List;

public class MJPApplication extends Application {
    private MJPApi api = new MJPApi();
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;
    private List<Nationality> nationalities;
    private List<ApplicationStatus> applicationStatuses;
    private List<JobStatus> jobStatuses;
    private List<Sex> sexes;

    public MJPApi getApi() {
        return api;
    }

    public void setSectors(List<Sector> sectors) {
        this.sectors = sectors;
    }

    public List<Sector> getSectors() {
        return sectors;
    }

    public void setContracts(List<Contract> contracts) {
        this.contracts = contracts;
    }

    public List<Contract> getContracts() {
        return contracts;
    }

    public void setHours(List<Hours> hours) {
        this.hours = hours;
    }

    public List<Hours> getHours() {
        return hours;
    }

    public void setNationalities(List<Nationality> nationalities) {
        this.nationalities = nationalities;
    }

    public List<Nationality> getNationalities() {
        return nationalities;
    }

    public void setApplicationStatuses(List<ApplicationStatus> applicationStatuses) {
        this.applicationStatuses = applicationStatuses;
    }

    public List<ApplicationStatus> getApplicationStatuses() {
        return applicationStatuses;
    }

    public List<JobStatus> getJobStatuses() {
        return jobStatuses;
    }

    public void setJobStatuses(List<JobStatus> jobStatuses) {
        this.jobStatuses = jobStatuses;
    }

    public JobStatus getJobStatus(String name) {
        for (JobStatus status : jobStatuses)
            if (status.getName().equals(name))
                return status;
        return null;
    }

    public List<Sex> getSexes() {
        return sexes;
    }

    public void setSexes(List<Sex> sexes) {
        this.sexes = sexes;
    }
}
