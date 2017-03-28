package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

public class DeleteBusinessImageTask extends DeleteAPITask {
    public DeleteBusinessImageTask(final Integer id) {
        super(new Action() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().deleteBusinessImage(id);
            }
        });
    }
}
