package com.myjobpitch.api;

import java.util.Date;

/**
 * Created by Jamie on 13/04/2015.
 */
public class MJPObjectWithDates extends MJPAPIObject {
    private Date created;
    private Date updated;

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
    }
}
