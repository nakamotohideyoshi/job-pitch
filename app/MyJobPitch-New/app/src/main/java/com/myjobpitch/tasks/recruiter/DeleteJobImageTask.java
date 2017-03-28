package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

public class DeleteJobImageTask extends DeleteAPITask {
    public DeleteJobImageTask(final Integer id) {
        super(new Action() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().deleteJobImage(id);
            }
        });
    }
}
