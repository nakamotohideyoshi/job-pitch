package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadBusinessesTask extends ReadAPITask<List<Business>> {
    public ReadBusinessesTask(final MJPApi api) {
        super(api, new Action<List<Business>>() {
            @Override
            public List<Business> run() throws MJPApiException {
                return api.getBusinesses();
            }
        });
    }
}
