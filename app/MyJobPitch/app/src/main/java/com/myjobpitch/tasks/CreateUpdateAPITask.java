package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

/**
* Created by Jamie on 24/03/2015.
*/
public class CreateUpdateAPITask<T extends MJPAPIObject> extends AsyncTask<Void, Void, T> {
    private List<Listener> listeners = new ArrayList<>();

    public interface Listener<T> {
        void onSuccess(T result);
        void onError(JsonNode errors);
        void onCancelled();
    }

    public interface Action<T> {
        T create(T obj) throws MJPApiException;
        T update(T obj) throws MJPApiException;
    }

    private final Action<T> action;
    private JsonNode errors;
    private T object;

    public CreateUpdateAPITask(T object, Action<T> action) {
        this.action = action;
        this.object = object;
    }

    public void addListener(Listener listener) {
        this.listeners.add(listener);
    }

    @Override
    protected T doInBackground(Void... params) {
        try {
            if (object.getId() == null)
                return action.create(object);
            else
                return action.update(object);
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("CreateLocation", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(final T result) {
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
