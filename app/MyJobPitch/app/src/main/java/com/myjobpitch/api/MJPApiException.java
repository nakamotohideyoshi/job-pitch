package com.myjobpitch.api;

import android.util.Log;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;

/**
 * Created by Jamie on 23/03/2015.
 */
public class MJPApiException extends Exception {
    private JsonNode errors;

    public MJPApiException(HttpClientErrorException e) {
        super(e);
        ObjectMapper mapper = new ObjectMapper();
        JsonFactory factory = mapper.getFactory();
        try {
            Log.e("MJPApiException", e.getResponseBodyAsString());
            errors = mapper.readTree(e.getResponseBodyAsByteArray());
        } catch (IOException e1) {}
    }

    public JsonNode getErrors() {
        return errors;
    }
}
