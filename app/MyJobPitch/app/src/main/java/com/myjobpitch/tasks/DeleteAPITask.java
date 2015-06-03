package com.myjobpitch.tasks;

import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

import java.util.ArrayList;
import java.util.List;

public class DeleteAPITask extends APITask<Void> {
    private List<DeleteAPITaskListener> listeners = new ArrayList<>();
    private boolean connectionError = false;

    public interface Action {
        void run() throws MJPApiException;
    }

    private Action action;
    private JsonNode errors;

    public DeleteAPITask(MJPApi api, Action action) {
        this.action = action;
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
        } catch (Exception e) {
            e.printStackTrace();
            connectionError = true;
        }
        return null;
    }

    @Override
    protected void onPostExecute(Void result) {
        super.onPostExecute(result);
        for (DeleteAPITaskListener listener : listeners) {
            if (connectionError)
                listener.onConnectionError();
            else if (errors == null)
                listener.onSuccess();
            else
                listener.onError(errors);
        }
    }

    @Override
    protected void onCancelled() {
        super.onCancelled();
        for (DeleteAPITaskListener listener : listeners)
            listener.onCancelled();
    }
}
