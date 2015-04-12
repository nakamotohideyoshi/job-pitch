package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.ReadMJPAPITask;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserJobSeekerTask extends ReadMJPAPITask<JobSeeker> {
    public ReadUserJobSeekerTask(final MJPApi api) {
        super(api, JobSeeker.class, api.getUser().getJob_seeker());
    }
}
