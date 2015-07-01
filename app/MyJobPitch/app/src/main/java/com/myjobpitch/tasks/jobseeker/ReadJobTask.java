package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.ReadAPITask;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobTask extends ReadAPITask<Job> {
    public ReadJobTask(final MJPApi api, final Integer job_id) {
        super(new Action<Job>() {
            @Override
            public Job run() throws MJPApiException {
                return api.get(Job.class, job_id);
            }
        });
    }
}
