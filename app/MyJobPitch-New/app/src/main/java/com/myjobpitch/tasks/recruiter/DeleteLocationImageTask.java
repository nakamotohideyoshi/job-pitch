package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

public class DeleteLocationImageTask extends DeleteAPITask {
    public DeleteLocationImageTask(final Integer id) {
        super(new Action() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().deleteLocationImage(id);
            }
        });
    }
}
