package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

/**
 * Created by Jamie on 26/03/2015.
 */
public class DeleteUserJobTask extends DeleteAPITask {
    public DeleteUserJobTask(final Integer id) {
        super( new Action() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().deleteJob(id);
            }
        });
    }
}
