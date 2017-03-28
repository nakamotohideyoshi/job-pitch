package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.ReadMJPAPITask;
import com.myjobpitch.utils.AppData;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserJobSeekerTask extends ReadMJPAPITask<JobSeeker> {
    public ReadUserJobSeekerTask() {
        super(JobSeeker.class, AppData.user.getJob_seeker());
    }
}
