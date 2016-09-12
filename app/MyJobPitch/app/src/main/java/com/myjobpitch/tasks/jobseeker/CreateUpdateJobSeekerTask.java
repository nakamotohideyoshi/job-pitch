package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.CreateUpdateAPITask;

public class CreateUpdateJobSeekerTask extends CreateUpdateAPITask<JobSeeker> {
    public CreateUpdateJobSeekerTask(final MJPApi api, final JobSeeker jobSeeker) {
        super(jobSeeker, new Action<JobSeeker>() {
            @Override
            public JobSeeker create(JobSeeker jobSeeker) throws MJPApiException {
                return api.create(JobSeeker.class, jobSeeker);
            }

            @Override
            public JobSeeker update(JobSeeker jobSeeker) throws MJPApiException {
                return api.updateJobSeeker(jobSeeker);
            }
        });
    }
}