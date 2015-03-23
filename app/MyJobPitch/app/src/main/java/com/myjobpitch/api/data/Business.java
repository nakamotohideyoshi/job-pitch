package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import java.util.Date;
import java.util.List;

public class Business extends MJPAPIObject {
    private int id;
    private String name;
    private List<Integer> users;
    private Date created;
    private Date updated;

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<Integer> getUsers() {
        return users;
    }

    public Date getCreated() {
        return created;
    }

    public Date getUpdated() {
        return updated;
    }
}
