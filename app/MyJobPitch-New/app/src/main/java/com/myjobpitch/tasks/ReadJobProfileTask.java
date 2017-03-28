package com.myjobpitch.tasks;

import com.myjobpitch.api.data.JobProfile;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobProfileTask extends ReadMJPAPITask<JobProfile> {
    public ReadJobProfileTask(final Integer id) {
        super(JobProfile.class, id);
    }
}
