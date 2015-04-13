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
    public ReadJobSeekersTask(final MJPApi api, final Integer job_id, final boolean applied, final boolean shortlisted) {
        super(new Action<List<JobSeeker>>() {
            @Override
            public List<JobSeeker> run() throws MJPApiException {
                String query = String.format("job=%s", job_id);
                if (applied) {
                    query += "&applied=1";
                    if (shortlisted)
                        query += "&shortlisted=1";
                }
                return api.get(JobSeeker.class, query);
            }
        });
    }
}
