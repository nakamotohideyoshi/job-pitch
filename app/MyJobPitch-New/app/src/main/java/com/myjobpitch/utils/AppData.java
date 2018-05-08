package com.myjobpitch.utils;

import android.support.v7.app.AppCompatActivity;

import com.myjobpitch.MainActivity;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.MJPObjectWithName;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.InitialTokens;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import java.util.HashMap;
import java.util.List;

public class AppData {

    public static final boolean PRODUCT_VERSION = false;

    public static User user;
    public static boolean existProfile = false;

    public static InitialTokens initialTokens;

    private static HashMap<Class<? extends MJPAPIObject>, List<? extends MJPAPIObject>> data = new HashMap<>();

    public static <T extends MJPAPIObject> List<T> get(Class<T> cls) {
        return (List<T>) data.get(cls);
    }

    public static void loadData() throws MJPApiException {
        user = MJPApi.shared().getUser();
        if (user.isJobSeeker()) {
            JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, user.getJob_seeker());
            existProfile = jobSeeker.getProfile() != null;
        }

        initialTokens = MJPApi.shared().getInitialTokens();
        data.put(Sector.class, MJPApi.shared().get(Sector.class));
        data.put(Contract.class, MJPApi.shared().get(Contract.class));
        data.put(Hours.class, MJPApi.shared().get(Hours.class));
        data.put(Nationality.class, MJPApi.shared().get(Nationality.class));
        data.put(ApplicationStatus.class, MJPApi.shared().get(ApplicationStatus.class));
        data.put(JobStatus.class, MJPApi.shared().get(JobStatus.class));
        data.put(Sex.class, MJPApi.shared().get(Sex.class));
        data.put(Role.class, MJPApi.shared().get(Role.class));
    }

    public static void clearData() {
        user = null;
        existProfile = false;
        data = new HashMap<>();
    }

    public static <T extends MJPAPIObject> T get(Class<T> cls, Integer id) {
        for (T obj : get(cls))
            if (obj.getId().equals(id))
                return obj;
        return null;
    }

    public static <T extends MJPObjectWithName> T get(Class<T> cls, String name) {
        for (T obj : get(cls))
            if (obj.getName().equals(name))
                return obj;
        return null;
    }

    public static Role getUserRole() {
        String role = user.isJobSeeker() ? Role.JOB_SEEKER : Role.RECRUITER;
        return AppData.get(Role.class, role);
    }

    public final static int PAGE_FIND_JOB = 0;
    public final static int PAGE_JS_APPLICATIONS = 1;
    public final static int PAGE_MESSAGES = 2;
    public final static int PAGE_JOB_PROFILE = 3;
    public final static int PAGE_ADD_RECORD = 4;
    public final static int PAGE_VIEW_PROFILE = 5;
    public final static int PAGE_USER_PROFILE = 6;
    public final static int PAGE_FIND_TALENT = 7;
    public final static int PAGE_R_APPLICATIONS = 8;
    public final static int PAGE_CONNECTIONS = 9;
    public final static int PAGE_MY_SHORTLIST = 10;
    public final static int PAGE_ADD_JOB = 11;
    public final static int PAGE_PAYMENT = 12;
    public final static int PAGE_CHANGE_PASS = 13;
    public final static int PAGE_HELP = 14;
    public final static int PAGE_LOGOUT = 15;
    public final static int PAGE_CONTACT_UP = 16;
    public final static int PAGE_SHARE = 17;

    public static final int JOBSEEKER = 1;
    public static final int RECRUITER = 2;


    public static final int REQUEST_IMAGE_CAPTURE = 10000;
    public static final int REQUEST_IMAGE_PICK = 10001;
    public static final int REQUEST_GOOGLE_DRIVE = 10002;
    public static final int REQUEST_DROPBOX = 10003;


    /************ Shared Preferences ***********/

    public static String getEmail() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("email", "");
    }

    public static boolean getRemember() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getBoolean("remember", false);
    }

    public static int getUserType() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getInt("usermode", 0);
    }

    public static String getToken() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("token", "");
    }

    public static String getServerUrl() {
        return MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).getString("server", null);
    }

    public static void saveLoginInfo(String email, boolean remember) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("email", email)
                .putBoolean("remember", remember)
                .apply();
    }

    public static void saveUserType(int usertype) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putInt("usermode", usertype)
                .apply();
    }

    public static void saveToken(String key) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("token", key)
                .apply();
    }

    public static void saveServerUrl(String url) {
        MainActivity.shared().getSharedPreferences("LoginPreferences", AppCompatActivity.MODE_PRIVATE).edit()
                .putString("server", url)
                .apply();
    }

}
