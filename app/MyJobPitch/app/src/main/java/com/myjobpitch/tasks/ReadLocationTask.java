package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Location;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadLocationTask extends ReadMJPAPITask<Location> {
    public ReadLocationTask(final MJPApi api, final Integer id) {
        super(api, Location.class, id);
    }
}
