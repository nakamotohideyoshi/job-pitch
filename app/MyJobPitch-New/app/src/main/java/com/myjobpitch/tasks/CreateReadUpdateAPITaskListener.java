package com.myjobpitch.tasks;

import com.fasterxml.jackson.databind.JsonNode;

/**
* Created by Jamie on 11/04/2015.
*/
public interface CreateReadUpdateAPITaskListener<T> {
    void onSuccess(T result);
    void onError(JsonNode errors);
    void onConnectionError();
    void onCancelled();
}
