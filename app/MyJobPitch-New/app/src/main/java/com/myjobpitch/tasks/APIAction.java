package com.myjobpitch.tasks;

import com.myjobpitch.api.MJPApiException;

public interface APIAction {
    void run() throws MJPApiException;
}