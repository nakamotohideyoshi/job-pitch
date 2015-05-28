package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadApplicationTask extends ReadAPITask<Application> {
    public ReadApplicationTask(final MJPApi api, final Integer applicationId) {
        super(new Action<Application>() {
            @Override
            public Application run() throws MJPApiException {
                return api.get(Application.class, applicationId);
            }
        });
    }
}
