package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;

import java.util.ArrayList;
import java.util.List;

public class ReadAPITask<T> extends AsyncTask<Void, Void, T> {
    private List<Listener> listeners = new ArrayList<>();

    public interface Listener<T> {
        void onSuccess(T result);
        void onError(JsonNode errors);
        void onCancelled();
    }

    public interface Action<T> {
        T run() throws MJPApiException;
    }

    private final MJPApi api;
    private Action<T> action;
    private JsonNode errors;
    private T result;

    public ReadAPITask(MJPApi api, Action<T> action) {
        this.action = action;
        this.api = api;
    }

    public void addListener(Listener<T> listener) {
        listeners.add(listener);
    }

    @Override
    protected T doInBackground(Void... params) {
        try {
            return action.run();
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("ReadAPITask", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(T result) {
        for (Listener listener : listeners) {
            if (errors == null)
                listener.onSuccess(result);
            else
                listener.onError(errors);
        }
    }

    @Override
    protected void onCancelled() {
        for (Listener listener : listeners)
            listener.onCancelled();
    }
}
