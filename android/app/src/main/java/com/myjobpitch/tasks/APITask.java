package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class APITask extends AsyncTask<Void, Void, Boolean> {

    private APIAction action;
    private JsonNode errors;
    private List<APITaskListener> listeners = new ArrayList<>();

    public APITask(APIAction action) {
        this.action = action;
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        try {
            action.run();
            return true;
        } catch (HttpClientErrorException e) {
            int statusCode = e.getStatusCode().value();
            if (statusCode == 400) {
                ObjectMapper mapper = new ObjectMapper();
                try {
                    Log.e("MJPApiException", e.getResponseBodyAsString());
                    errors = mapper.readTree(e.getResponseBodyAsByteArray());
                } catch (IOException e1) {}
            } else if (statusCode == 403) {
                ObjectMapper mapper = new ObjectMapper();
                try {
                    Log.e("MJPApiException", e.getResponseBodyAsString());
                    errors = mapper.readTree(e.getResponseBodyAsByteArray());
                } catch (IOException e1) {}
            } else {
                e.printStackTrace();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    @Override
    protected void onPostExecute(Boolean success) {
        for (APITaskListener listener : listeners) {
            if (success)
                listener.onSuccess();
            else
                listener.onError(errors);
        }
    }

    public APITask addListener(APITaskListener listener) {
        listeners.add(listener);
        return this;
    }

}
