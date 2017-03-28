package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.CreateUpdateAPITask;

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