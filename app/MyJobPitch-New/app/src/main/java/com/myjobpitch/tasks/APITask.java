package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApiException;

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
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("APITask", errors.toString());
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
