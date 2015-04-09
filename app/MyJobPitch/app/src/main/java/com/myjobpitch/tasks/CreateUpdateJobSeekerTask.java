package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;

public class CreateUpdateJobSeekerTask extends CreateUpdateAPITask<JobSeeker> {
    public CreateUpdateJobSeekerTask(final MJPApi api, final JobSeeker jobSeeker) {
        super(jobSeeker, new Action<JobSeeker>() {
            @Override
            public JobSeeker create(JobSeeker jobSeeker) throws MJPApiException {
                return api.createJobSeeker(jobSeeker);
            }

            @Override
            public JobSeeker update(JobSeeker jobSeeker) throws MJPApiException {
                return api.updateJobSeeker(jobSeeker);
            }
        });
    }
}