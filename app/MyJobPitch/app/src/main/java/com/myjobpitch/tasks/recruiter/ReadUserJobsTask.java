package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserJobsTask extends ReadAPITask<List<Job>> {
    public ReadUserJobsTask(final MJPApi api, final Integer location_id) {
        super(new Action<List<Job>>() {
            @Override
            public List<Job> run() throws MJPApiException {
                return api.getUserJobs(location_id);
            }
        });
    }
}
