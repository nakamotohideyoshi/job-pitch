package com.myjobpitch.utils;

import android.support.v7.app.AppCompatActivity;

import com.myjobpitch.MainActivity;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPObjectWithName;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.BusinessUser;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.InitialTokens;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class AppData {

    public static final int API_VERSION = 6;
    public static final boolean PRODUCTION = false;

    public static final int DEFAULT_REFRESH_TIME = 30;
    public static final int MESSAGE_REFRESH_TIME = 5;

    public static boolean existProfile = false;

    public static final int JOBSEEKER = 1;
    public static final int RECRUITER = 2;


    public static final int REQUEST_IMAGE_CAPTURE = 10000;
    public static final int REQUEST_IMAGE_PICK = 10001;
    public static final int REQUEST_GOOGLE_DRIVE = 10002;
    public static final int REQUEST_DROPBOX = 10003;


    public static User user;

    public static List<Hours> hours;
    public static List<Contract> contracts;
    public static List<Sex> sexes;
    public static List<Nationality> nationalities;
    public static List<Sector> sectors;
    public static List<JobStatus> jobStatuses;
    public static List<ApplicationStatus> applicationStatuses;
    public static List<Role> roles;
    public static InitialTokens initialTokens;

    public static int userRole = -1;
    public static JobSeeker jobSeeker;
    public static JobProfile profile;

    public static List<Business> businesses = new ArrayList<>();
    public static List<Location> workplaces = new ArrayList<>();
    public static List<Job> jobs = new ArrayList<>();
    public static List<BusinessUser> businessUsers = new ArrayList<>();
    public static List<JobSeeker> jobSeekers = new ArrayList<>();
    public static List<Application> applications = new ArrayList<>();
    public static int newMessageCount = 0;

    public static int appsRefreshTime = DEFAULT_REFRESH_TIME;
    //    public static var appsUpdateCallback: (() -> Void)?


    /************ Shared Preferences ***********/

    public static String getEmail() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("email", "");
    }

    public static void saveEmail(String email) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("email", email)
                .apply();
    }

    public static String getToken() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("token", "");
    }

    public static void saveToken(String key) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("token", key)
                .apply();
    }

    public static String getServerUrl() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("server", null);
    }

    public static void saveServerUrl(String url) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("server", url)
                .apply();
    }

    public static void clearData() {
        existProfile = false;

        user = null;
        userRole = -1;
        jobSeeker = null;
        profile = null;

        businesses.clear();
        workplaces.clear();
        jobs.clear();
        businessUsers.clear();
        jobSeekers.clear();
        applications.clear();

        stopTimer();
    }

    public static void loadData() {
        user = MJPApi.shared().getUser();
        if (user.isJobSeeker()) {
            JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, user.getJob_seeker());
            existProfile = jobSeeker.getProfile() != null;
        }

        if (initialTokens == null) {
            hours = MJPApi.shared().get(Hours.class);
            contracts = MJPApi.shared().get(Contract.class);
            sexes = MJPApi.shared().get(Sex.class);
            nationalities = MJPApi.shared().get(Nationality.class);
            sectors =  MJPApi.shared().get(Sector.class);
            jobStatuses = MJPApi.shared().get(JobStatus.class);
            applicationStatuses = MJPApi.shared().get(ApplicationStatus.class);
            roles = MJPApi.shared().get(Role.class);
            initialTokens = MJPApi.shared().getInitialTokens();

            JobStatus.OPEN_ID = getIdByName(jobStatuses, JobStatus.OPEN);
            JobStatus.CLOSED_ID = getIdByName(jobStatuses, JobStatus.CLOSED);
            ApplicationStatus.CREATED_ID = getIdByName(applicationStatuses, ApplicationStatus.CREATED);
            ApplicationStatus.ESTABLISHED_ID = getIdByName(applicationStatuses, ApplicationStatus.ESTABLISHED);
            ApplicationStatus.DELETED_ID = getIdByName(applicationStatuses, ApplicationStatus.DELETED);
            Role.JOB_SEEKER_ID = getIdByName(roles, Role.JOB_SEEKER);
            Role.RECRUITER_ID = getIdByName(roles, Role.RECRUITER);
        }

        if (user.isJobSeeker()) {
            userRole = Role.JOB_SEEKER_ID;
            getJobSeeker();
            getProfile();
            if (profile != null) {
                getApplications();
                startTimer();
            }
        } else if (user.isRecruiter()) {
            userRole = Role.RECRUITER_ID;
            getBusinesses();
            getApplications();
            startTimer();
        }
    }


    public static <T extends MJPObjectWithName> int getIdByName(List<T> objects, String name) {
        for (T obj : objects) {
            if (obj.getName().equals(name)) {
                return obj.getId();
            }
        }
        return -1;
    }

    public static <T extends MJPObjectWithName> String getNameById(List<T> objects, Integer id) {
        T obj = getObjById(objects, id);
        return obj != null ? obj.getName() : null;
    }

    public static <T extends MJPAPIObject> T getObjById(List<T> objects, Integer id) {
        for (T obj : objects) {
            if (obj.getId() == id) {
                return obj;
            }
        }
        return null;
    }

    public static <T extends MJPAPIObject> void updateObj(List<T> objects, T updatedObj) {
        T obj = getObjById(objects, updatedObj.getId());
        if (obj != null) {
            objects.set(objects.indexOf(obj), updatedObj);
        } else {
            objects.add(0, updatedObj);
        }
    }

    //================ menu =============

    static void getJobSeeker() {
        if (user.isJobSeeker()) {
            jobSeeker = MJPApi.shared().get(JobSeeker.class, user.getJob_seeker());
        }
    }

    static void getProfile() {
        if (jobSeeker.getProfile() != null) {
            profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
        }
    }

    //================ businesses =============

    public static void getBusinesses() {
        businesses = MJPApi.shared().getUserBusinesses();
    }

    public static void updateBusiness(Business busienss) {
        updateObj(businesses, busienss);
    }

    public static void getBusiness(Integer businessId) {
        Business business = MJPApi.shared().getUserBusiness(businessId);
        updateBusiness(business);
    }

    public void removeBusiness(Integer businessId) {
        Business obj = getObjById(businesses, businessId);
        if (obj != null) {
            businesses.remove(obj);
        }
    }

    //================ workplaces =============

    public static void getWorkplaces(Integer businessId) {
        workplaces = MJPApi.shared().getUserLocations(businessId);
    }

    public static void updateWorkplace(Location workplace) {
        updateObj(workplaces, workplace);
        updateBusiness(workplace.getBusiness_data());
    }

    public static void getWorkplace(Integer workplaceId) {
        Location location = MJPApi.shared().getUserLocation(workplaceId);
        updateWorkplace(location);
    }

    public void removeWorkplace(Integer workplaceId) {
        Location obj = getObjById(workplaces, workplaceId);
        if (obj != null) {
            workplaces.remove(obj);
        }
    }

    //================ jobs =============

    public static void getJobs(Integer locationId) {
        jobs = MJPApi.shared().getUserJobs(locationId);
    }

    public static void searchJobs() {
        jobs = MJPApi.shared().get(Job.class);
    }

    public static void updateJob(Job job) {
        updateObj(jobs, job);
        updateWorkplace(job.getLocation_data());
    }

    public static void getJob(Integer jobId) {
        Job job = MJPApi.shared().getUserJob(jobId);
        updateJob(job);
    }

    public void removeJob(Integer jobId) {
        Job obj = getObjById(jobs, jobId);
        if (obj != null) {
            jobs.remove(obj);
        }
    }

    //================ jobseekers =============

    public static void searchJobseekers(Integer jobId) {
        jobSeekers = MJPApi.shared().get(JobSeeker.class, "job=" + jobId);
    }

    public void removeJobseeker(Integer jobseekerId) {
        JobSeeker obj = getObjById(jobSeekers, jobseekerId);
        if (obj != null) {
            jobSeekers.remove(obj);
        }
    }

    //================ business users =============

    public static void getBusinessUsers(Integer businessId) {
        businessUsers = MJPApi.shared().getBusinessUsers(businessId);
    }

    public static void getBusinessUser(Integer businessId, Integer userId) {
        BusinessUser obj = MJPApi.shared().getBusinessUser(businessId, userId);
        updateObj(businessUsers, obj);
    }

    public void removeBusinessBuser(Integer userId) {
        BusinessUser obj = getObjById(businessUsers, userId);
        if (obj != null) {
            businessUsers.remove(obj);
        }
    }

    //================ applications =============

    static Timer timer;
    static int time = 0;

    public static void startTimer() {
        if (timer == null) {
            time = 0;
            timer = new Timer();
            timer.schedule(new TimerTask() {
                @Override
                public void run() {
                    time++;
                    if (time >= appsRefreshTime) {
                        time = 0;
                        getApplications();
                    }
                }
            }, 0, 1000);
        }
    }

    static void stopTimer() {
        if (timer != null) {
            timer.cancel();
            timer = null;
        }
    }

    static void getNewMessageCount() {
        newMessageCount = 0;

        for (Application app : applications) {
            int count = 0;
            for (int i = app.getMessages().size() - 1; i >= 0; i--) {
                Message message = app.getMessages().get(i);
                if (message.getRead()) {
                    break;
                }
                if (message.getFrom_role() == userRole) {
                    break;
                }
                count++;
            }

            newMessageCount += count;
        }
    }

    public static void getApplications() {
        applications = MJPApi.shared().get(Application.class);
        getNewMessageCount();
    }

    public static void getApplication(Integer id) {
        Application obj = MJPApi.shared().get(Application.class, id);
        updateObj(applications, obj);
        getNewMessageCount();
    }

}
