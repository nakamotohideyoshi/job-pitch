package com.myjobpitch.tasks;

import com.fasterxml.jackson.databind.JsonNode;

/**
* Created by Jamie on 11/04/2015.
*/
public interface DeleteAPITaskListener {
    void onSuccess();
    void onError(JsonNode errors);
    void onCancelled();
}
