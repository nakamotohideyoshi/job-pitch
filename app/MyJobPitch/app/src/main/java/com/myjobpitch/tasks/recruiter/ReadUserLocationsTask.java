package com.myjobpitch.tasks.recruiter;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.ReadAPITask;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadUserLocationsTask extends ReadAPITask<List<Location>> {
    public ReadUserLocationsTask(final MJPApi api, final Integer business_id) {
        super(new Action<List<Location>>() {
            @Override
            public List<Location> run() throws MJPApiException {
                return api.getUserLocations(business_id);
            }
        });
    }
}
