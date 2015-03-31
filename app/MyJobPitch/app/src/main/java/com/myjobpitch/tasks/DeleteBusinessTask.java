package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

/**
 * Created by Jamie on 26/03/2015.
 */
public class DeleteBusinessTask extends DeleteAPITask {
    public DeleteBusinessTask(final MJPApi api, final Integer id) {
        super(api, new Action() {
            @Override
            public void run() throws MJPApiException {
                api.deleteBusiness(id);
            }
        });
    }
}
