package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadBusinessTask extends ReadAPITask<Business> {
    public ReadBusinessTask(final MJPApi api, final Integer id) {
        super(api, new Action<Business>() {
            @Override
            public Business run() throws MJPApiException {
                return api.getBusiness(id);
            }
        });
    }
}
