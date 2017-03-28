package com.myjobpitch.tasks;

import com.myjobpitch.api.data.Location;

/**
 * Created by Jamie on 26/03/2015.
 */
public class ReadLocationTask extends ReadMJPAPITask<Location> {
    public ReadLocationTask(final Integer id) {
        super(Location.class, id);
    }
}
