package com.myjobpitch;

import android.app.Application;
import android.util.Log;

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
import com.myjobpitch.tasks.APITask;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MJPApplication extends Application {
    private MJPApi api = new MJPApi();
    Map<Class<? extends MJPAPIObject>, List<? extends MJPAPIObject>> cache = new HashMap<>();

    public MJPApi getApi() {
        return api;
    }

    class LoadCacheTask extends APITask<Boolean> {
        private Class<? extends MJPAPIObject> mCls;

        public LoadCacheTask(Class<? extends MJPAPIObject> cls) {
            mCls = cls;
        }

        @Override
        protected Boolean doInBackground(Void... params) {
            try {
                Log.d("LoadCacheTask", "loading " + mCls.getName());
                cache(mCls);
                Log.d("LoadCacheTask", "loading " + mCls.getName() + " complete");
                return true;
            } catch (Exception e) {
                Log.d("LoadCacheTask", "error loading " + mCls.getName());
                return false;
            }
        }
    }

    public List<APITask<Boolean>> getLoadActions() {
        List<APITask<Boolean>> actions = new ArrayList<>();
        actions.add(new LoadCacheTask(Sector.class));
        actions.add(new LoadCacheTask(Contract.class));
        actions.add(new LoadCacheTask(Hours.class));
        actions.add(new LoadCacheTask(Nationality.class));
        actions.add(new LoadCacheTask(ApplicationStatus.class));
        actions.add(new LoadCacheTask(JobStatus.class));
        actions.add(new LoadCacheTask(Sex.class));
        actions.add(new LoadCacheTask(Role.class));
        return actions;
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
