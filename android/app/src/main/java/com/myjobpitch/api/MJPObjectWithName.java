package com.myjobpitch.api;

/**
 * Created by Jamie on 11/04/2015.
 */
public class MJPObjectWithName extends MJPAPIObject {
    private String name;

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return this.name;
    }
}
