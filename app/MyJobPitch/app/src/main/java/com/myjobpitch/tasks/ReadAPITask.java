package com.myjobpitch.tasks;

import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

public class ReadAPITask<T> extends APITask<T> {
    private List<CreateReadUpdateAPITaskListener<T>> listeners = new ArrayList<>();

    public interface Action<T> {
        T run() throws MJPApiException;
    }

    private Action<T> action;
    private JsonNode errors;
    private T result;

    public ReadAPITask(Action<T> action) {
        this.action = action;
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
