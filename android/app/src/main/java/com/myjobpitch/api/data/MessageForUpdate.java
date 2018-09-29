package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

/**
 * Created by Jamie on 27/05/2015.
 */
public class MessageForUpdate extends MJPAPIObject {
    protected Boolean read;

    public void setId(Integer id) {
        this.id = id;
    }

    public Boolean getRead() {
        return read;
    }

    public void setRead(Boolean read) {
        this.read = read;
    }
}
