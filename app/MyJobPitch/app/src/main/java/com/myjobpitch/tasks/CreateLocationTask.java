package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Location;

import java.util.ArrayList;
import java.util.List;

/**
* Created by Jamie on 24/03/2015.
*/
public class CreateLocationTask extends AsyncTask<Void, Void, Void> {
    private List<Listener> listeners = new ArrayList<>();

    public interface Listener {
        void onSuccess(Location location);
        void onError(JsonNode errors);
        void onCancelled();
    }
    private JsonNode errors;
    private final MJPApi api;
    private Location location;

    public CreateLocationTask(MJPApi api, Location location) {
        this.api = api;
        this.location = location;
    }

    public void addListener(Listener listener) {
        this.listeners.add(listener);
    }

    @Override
    protected Void doInBackground(Void... params) {
        try {
            if (location.getId() == null)
                location = api.createLocation(location);
            else
                location = api.updateLocation(location);
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
                listener.onSuccess(location);
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
