package com.myjobpitch.tasks;

import com.myjobpitch.api.data.JobSeeker;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobSeekerTask extends ReadMJPAPITask<JobSeeker> {
    public ReadJobSeekerTask(final Integer id) {
        super(JobSeeker.class, id);
    }
}
