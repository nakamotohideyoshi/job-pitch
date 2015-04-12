package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserBusinessesTask extends ReadAPITask<List<Business>> {
    public ReadUserBusinessesTask(final MJPApi api) {
        super(new Action<List<Business>>() {
            @Override
            public List<Business> run() throws MJPApiException {
                return api.getUserBusinesses();
            }
        });
    }
}
