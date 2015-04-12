package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.ReadAPITask;

public class ReadUserBusinessTask extends ReadAPITask<Business> {
    public ReadUserBusinessTask(final MJPApi api, final Integer id) {
        super(new Action<Business>() {
            @Override
            public Business run() throws MJPApiException {
                return api.getUserBusiness(id);
            }
        });
    }
}
