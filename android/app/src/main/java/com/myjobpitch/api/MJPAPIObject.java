package com.myjobpitch.api;

import java.io.Serializable;

public class MJPAPIObject implements Serializable {

    protected Integer id;

    public Integer getId() {
        return id;
    }

    @Override
    public boolean equals(Object other) {
        if (other instanceof MJPAPIObject && this.getId() != null && this.getClass().isInstance(other))
            return this.getId().equals(((MJPAPIObject)other).getId());
        return false;
    }

}
