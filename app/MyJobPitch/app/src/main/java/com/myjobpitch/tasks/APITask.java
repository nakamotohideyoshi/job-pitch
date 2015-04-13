package com.myjobpitch.tasks;

import android.os.AsyncTask;

import java.util.ArrayList;
import java.util.List;

public abstract class APITask<T> extends AsyncTask<Void, Void, T> {
    private List<APITaskListener> listeners = new ArrayList<>();
    private boolean executed = false;

    public void addListener(APITaskListener listener) {
        listeners.add(listener);
    }

    protected void onPostExecute(T result) {
        executed = true;
        for (APITaskListener listener : listeners)
            listener.onPostExecute();
    }

    @Override
    protected void onCancelled() {
        executed = true;
        for (APITaskListener listener : listeners)
            listener.onCancelled();
    }

    public boolean isExecuted() {
        return executed;
    }
}
