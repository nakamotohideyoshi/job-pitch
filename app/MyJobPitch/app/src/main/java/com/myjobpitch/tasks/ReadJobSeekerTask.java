package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobSeeker;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobSeekerTask extends ReadMJPAPITask<JobSeeker> {
    public ReadJobSeekerTask(final MJPApi api, final Integer id) {
        super(api, JobSeeker.class, id);
    }
}
