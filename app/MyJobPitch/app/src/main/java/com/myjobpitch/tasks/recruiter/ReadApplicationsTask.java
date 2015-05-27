package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadApplicationsTask extends ReadAPITask<List<Application>> {
    public ReadApplicationsTask(final MJPApi api, final Integer job_id, final boolean shortlisted) {
        super(new Action<List<Application>>() {
            @Override
            public List<Application> run() throws MJPApiException {
                String query = String.format("job=%s", job_id);
                if (shortlisted)
                    query += "&shortlisted=1";
                return api.get(Application.class, query);
            }
        });
    }

    public ReadApplicationsTask(final MJPApi api) {
        super(new Action<List<Application>>() {
            @Override
            public List<Application> run() throws MJPApiException {
                return api.get(Application.class);
            }
        });
    }
}
