package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobsTask extends ReadAPITask<List<Job>> {
    public ReadJobsTask(final MJPApi api, final Integer location_id) {
        super(api, new Action<List<Job>>() {
            @Override
            public List<Job> run() throws MJPApiException {
                return api.getUserJobs(location_id);
            }
        });
    }
}
