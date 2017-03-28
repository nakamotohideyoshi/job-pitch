package com.myjobpitch.tasks.jobseeker;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobsTask extends ReadAPITask<List<Job>> {
    public ReadJobsTask(final List<Integer> exclude) {
        super(new Action<List<Job>>() {
            @Override
            public List<Job> run() throws MJPApiException {
                if (exclude != null && !exclude.isEmpty()) {
                    StringBuilder sb = new StringBuilder("&exclude=");
                    for (Integer exclusion : exclude)
                        sb.append(exclusion).append(",");
                    sb.deleteCharAt(sb.lastIndexOf(","));
                    return MJPApi.shared().get(Job.class, sb.toString());
                }
                return MJPApi.shared().get(Job.class);
            }
        });
    }
}
