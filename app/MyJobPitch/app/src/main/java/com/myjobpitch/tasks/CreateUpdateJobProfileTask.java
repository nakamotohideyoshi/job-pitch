package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;

public class CreateUpdateJobProfileTask extends CreateUpdateAPITask<Job> {
    public CreateUpdateJobProfileTask(final MJPApi api, final Job job) {
        super(job, new Action<Job>() {
            @Override
            public Job create(Job job) throws MJPApiException {
                return api.createJob(job);
            }

            @Override
            public Job update(Job job) throws MJPApiException {
                return api.updateJob(job);
            }
        });
    }
}