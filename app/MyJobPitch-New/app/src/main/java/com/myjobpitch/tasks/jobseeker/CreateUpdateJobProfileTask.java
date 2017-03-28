package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.tasks.CreateUpdateAPITask;

public class CreateUpdateJobProfileTask extends CreateUpdateAPITask<JobProfile> {
    public CreateUpdateJobProfileTask(final JobProfile jobProfile) {
        super(jobProfile, new Action<JobProfile>() {
            @Override
            public JobProfile create(JobProfile jobProfile) throws MJPApiException {
                return MJPApi.shared().create(JobProfile.class, jobProfile);
            }

            @Override
            public JobProfile update(JobProfile jobProfile) throws MJPApiException {
                return MJPApi.shared().update(JobProfile.class, jobProfile);
            }
        });
    }
}