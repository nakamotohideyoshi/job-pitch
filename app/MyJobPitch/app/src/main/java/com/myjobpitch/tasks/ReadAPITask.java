package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

public class ReadAPITask<T> extends AsyncTask<Void, Void, T> {
    private List<CreateReadUpdateAPITaskListener<T>> listeners = new ArrayList<>();

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

    public void addListener(CreateReadUpdateAPITaskListener<T> listener) {
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
        for (CreateReadUpdateAPITaskListener<T> listener : listeners) {
            if (errors == null)
                listener.onSuccess(result);
            else
                listener.onError(errors);
        }
    }

    @Override
    protected void onCancelled() {
        for (CreateReadUpdateAPITaskListener<T> listener : listeners)
            listener.onCancelled();
    }
}
