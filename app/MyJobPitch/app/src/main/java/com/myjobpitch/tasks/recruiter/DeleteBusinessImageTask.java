package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.DeleteAPITask;

public class DeleteBusinessImageTask extends DeleteAPITask {
    public DeleteBusinessImageTask(final MJPApi api, final Integer id) {
        super(api, new Action() {
            @Override
            public void run() throws MJPApiException {
                api.deleteBusinessImage(id);
            }
        });
    }
}
