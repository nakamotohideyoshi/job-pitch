package com.myjobpitch.tasks;

import com.fasterxml.jackson.databind.JsonNode;

public interface APITaskListener {
    void onSuccess();
    void onError(JsonNode errors);
}
