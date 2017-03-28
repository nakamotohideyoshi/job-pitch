package com.myjobpitch.tasks;

public interface TaskListener<T> {
    void done(T result);
    void error(String error);
}
