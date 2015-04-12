package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

public class ReadMJPAPITask<T extends MJPAPIObject> extends ReadAPITask<T> {
    public ReadMJPAPITask(final MJPApi api, final Class<T> cls, final Integer id) {
        super(new Action<T>() {
            @Override
            public T run() throws MJPApiException {
                return api.get(cls, id);
            }
        });
    }
}
