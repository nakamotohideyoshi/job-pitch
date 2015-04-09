package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;

import java.util.ArrayList;
import java.util.List;

/**
* Created by Jamie on 24/03/2015.
*/
public class CreateUpdateJobTask extends AsyncTask<Void, Void, Void> {
    private List<Listener> listeners = new ArrayList<>();

    public interface Listener {
        void onSuccess(Job job);
        void onError(JsonNode errors);
        void onCancelled();
    }
    private JsonNode errors;
    private final MJPApi api;
    private Job job;

    public CreateUpdateJobTask(MJPApi api, Job job) {
        this.api = api;
        this.job = job;
    }

    public void addListener(Listener listener) {
        this.listeners.add(listener);
    }

    @Override
    protected Void doInBackground(Void... params) {
        try {
            if (job.getId() == null)
                job = api.createJob(job);
            else
                job = api.updateJob(job);
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("CreateLocation", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(final Void __) {
        for (Listener listener : listeners) {
            if (errors == null)
                listener.onSuccess(job);
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
