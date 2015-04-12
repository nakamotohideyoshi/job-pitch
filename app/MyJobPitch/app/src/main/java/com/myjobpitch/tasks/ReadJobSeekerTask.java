package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobSeekerTask extends ReadAPITask<JobSeeker> {
    public ReadJobSeekerTask(final MJPApi api, final Integer id) {
        super(api, new Action<JobSeeker>() {
            @Override
            public JobSeeker run() throws MJPApiException {
                return api.getJobSeeker(id);
            }
        });
    }
}
