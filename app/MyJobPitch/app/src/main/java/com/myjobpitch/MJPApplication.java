package com.myjobpitch;

import android.app.Application;

import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.MJPObjectWithName;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
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
        cache(Sector.class);
        cache(Contract.class);
        cache(Hours.class);
        cache(Nationality.class);
        cache(ApplicationStatus.class);
        cache(JobStatus.class);
        cache(Sex.class);
        cache(Role.class);
    }

    private <T extends MJPAPIObject> void cache(Class<T> cls) throws MJPApiException {
        cache.put(cls, getApi().get(cls));
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

    public <T extends MJPObjectWithName> T get(Class<T> cls, String name) {
        for (T obj : get(cls))
            if (obj.getName().equals(name))
                return obj;
        return null;
    }
}
