package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.ReadAPITask;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserJobTask extends ReadAPITask<Job> {
    public ReadUserJobTask(final Integer job_id) {
        super(new Action<Job>() {
            @Override
            public Job run() throws MJPApiException {
                return MJPApi.shared().getUserJob(job_id);
            }
        });
    }
}
