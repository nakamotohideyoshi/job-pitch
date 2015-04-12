package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobProfile;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobProfileTask extends ReadMJPAPITask<JobProfile> {
    public ReadJobProfileTask(final MJPApi api, final Integer id) {
        super(api, JobProfile.class, id);
    }
}
