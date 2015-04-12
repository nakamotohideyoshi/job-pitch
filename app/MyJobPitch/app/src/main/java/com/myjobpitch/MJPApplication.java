package com.myjobpitch;

import android.app.Application;

import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MJPApplication extends Application {
    private MJPApi api = new MJPApi();
    Map<Class<? extends MJPAPIObject>, List<? extends MJPAPIObject>> cache = new HashMap<>();

    public MJPApi getApi() {
        return api;
    }

    public void loadData() throws MJPApiException {
        cache.put(Sector.class, getApi().get(Sector.class));
        cache.put(Contract.class, getApi().get(Contract.class));
        cache.put(Hours.class, getApi().get(Hours.class));
        cache.put(Nationality.class, getApi().get(Nationality.class));
        cache.put(ApplicationStatus.class, getApi().get(ApplicationStatus.class));
        cache.put(JobStatus.class, getApi().get(JobStatus.class));
        cache.put(Sex.class, getApi().get(Sex.class));
    }

    public <T extends MJPAPIObject> List<T> get(Class<T> cls) {
        return (List<T>) cache.get(cls);
    }

    public <T extends MJPAPIObject> T get(Class<T> cls, Integer id) {
        for (T obj : get(cls))
            if (obj.getId().equals(id))
                return obj;
        return null;
    }

    public JobStatus getJobStatus(String name) {
        for (JobStatus jobStatus : get(JobStatus.class))
            if (jobStatus.getName().equals(name))
                return jobStatus;
        return null;
    }
}
