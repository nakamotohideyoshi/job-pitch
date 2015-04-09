package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Location;

import java.util.List;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadLocationsTask extends ReadAPITask<List<Location>> {
    public ReadLocationsTask(final MJPApi api, final Integer business_id) {
        super(api, new Action<List<Location>>() {
            @Override
            public List<Location> run() throws MJPApiException {
                return api.getUserLocations(business_id);
            }
        });
    }
}
