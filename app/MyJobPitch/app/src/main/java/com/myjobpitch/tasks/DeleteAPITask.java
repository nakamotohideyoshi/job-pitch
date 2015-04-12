package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

public class DeleteAPITask extends AsyncTask<Void, Void, Void> {
    private List<DeleteAPITaskListener> listeners = new ArrayList<>();

    public interface Action {
        void run() throws MJPApiException;
    }

    private final MJPApi api;
    private Action action;
    private JsonNode errors;

    public DeleteAPITask(MJPApi api, Action action) {
        this.action = action;
        this.api = api;
    }

    public void addListener(DeleteAPITaskListener listener) {
        listeners.add(listener);
    }

    @Override
    protected Void doInBackground(Void... params) {
        try {
            action.run();
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("ReadAPITask", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(Void result) {
        for (DeleteAPITaskListener listener : listeners) {
            if (errors == null)
                listener.onSuccess();
            else
                listener.onError(errors);
        }
    }

    @Override
    protected void onCancelled() {
        for (DeleteAPITaskListener listener : listeners)
            listener.onCancelled();
    }
}
