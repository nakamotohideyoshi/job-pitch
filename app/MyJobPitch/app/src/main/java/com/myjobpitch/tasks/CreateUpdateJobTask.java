package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;

public class CreateUpdateJobTask extends CreateUpdateAPITask<Job> {
    public CreateUpdateJobTask(final MJPApi api, final Job job) {
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