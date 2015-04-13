package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

/**
 * Created by Jamie on 26/03/2015.
 */
public class DeleteUserJobTask extends DeleteAPITask {
    public DeleteUserJobTask(final MJPApi api, final Integer id) {
        super(api, new Action() {
            @Override
            public void run() throws MJPApiException {
                api.deleteJob(id);
            }
        });
    }
}