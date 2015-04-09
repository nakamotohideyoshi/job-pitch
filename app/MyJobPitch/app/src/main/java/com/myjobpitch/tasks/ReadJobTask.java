package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadJobTask extends ReadAPITask<Job> {
    public ReadJobTask(final MJPApi api, final Integer id) {
        super(api, new Action<Job>() {
            @Override
            public Job run() throws MJPApiException {
                return api.getJob(id);
            }
        });
    }
}
