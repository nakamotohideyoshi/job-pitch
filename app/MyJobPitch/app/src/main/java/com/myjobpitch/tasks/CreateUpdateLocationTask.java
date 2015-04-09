package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;

public class CreateUpdateLocationTask extends CreateUpdateAPITask<Location> {
    public CreateUpdateLocationTask(final MJPApi api, final Location location) {
        super(location, new Action<Location>() {
            @Override
            public Location create(Location location) throws MJPApiException {
                return api.createLocation(location);
            }

            @Override
            public Location update(Location location) throws MJPApiException {
                return api.updateLocation(location);
            }
        });
    }
}