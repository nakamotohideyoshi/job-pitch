package com.myjobpitch.tasks;

import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

/**
* Created by Jamie on 24/03/2015.
*/
public class CreateUpdateAPITask<T extends MJPAPIObject> extends APITask<T> {
    private List<CreateReadUpdateAPITaskListener<T>> listeners = new ArrayList<>();

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

    public void addListener(CreateReadUpdateAPITaskListener<T> listener) {
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
            Log.d("CreateUpdateAPITask", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(final T result) {
        super.onPostExecute(result);
        for (CreateReadUpdateAPITaskListener<T> listener : listeners) {
            if (errors == null)
                listener.onSuccess(result);
            else
                listener.onError(errors);
        }
    }

    @Override
    protected void onCancelled() {
        super.onCancelled();
        for (CreateReadUpdateAPITaskListener<T> listener : listeners)
            listener.onCancelled();
    }
}
