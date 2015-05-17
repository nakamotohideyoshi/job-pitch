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
    public ReadJobSeekersTask(MJPApi api, Integer id) {
        this(api, id, null);
    }

    public ReadJobSeekersTask(final MJPApi api, final Integer job_id, final List<Integer> exclude) {
        super(new Action<List<JobSeeker>>() {
            @Override
            public List<JobSeeker> run() throws MJPApiException {
                String query = String.format("job=%s", job_id);
                if (exclude != null && !exclude.isEmpty()) {
                    StringBuilder sb = new StringBuilder("&exclude=");
                    for (Integer exclusion : exclude)
                        sb.append(exclusion).append(",");
                    sb.deleteCharAt(sb.lastIndexOf(","));
                    query += sb.toString();
                }
                return api.get(JobSeeker.class, query);
            }
        });
    }
}
