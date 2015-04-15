package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobSeekersTask extends ReadAPITask<List<JobSeeker>> {
    public ReadJobSeekersTask(final MJPApi api, final Integer job_id) {
        super(new Action<List<JobSeeker>>() {
            @Override
            public List<JobSeeker> run() throws MJPApiException {
                return api.get(JobSeeker.class, String.format("job=%s", job_id));
            }
        });
    }
}
