package com.myjobpitch.tasks;

import android.os.AsyncTask;
import android.util.Log;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;

import java.util.ArrayList;
import java.util.List;

public class CreateUpdateBusinessTask extends AsyncTask<Void, Void, Void> {
    private List<Listener> listeners = new ArrayList<>();

    public interface Listener {
        void onSuccess(Business business);
        void onError(JsonNode errors);
        void onCancelled();
    }
    private JsonNode errors;
    private final MJPApi api;
    private Business business;

    public CreateUpdateBusinessTask(MJPApi api, Business business) {
        this.api = api;
        this.business = business;
    }

    public void addListener(Listener listener) {
        listeners.add(listener);
    }

    @Override
    protected Void doInBackground(Void... params) {
        try {
            if (business.getId() == null)
                business = api.createBusiness(business);
            else
                business = api.updateBusiness(business);
        } catch (MJPApiException e) {
            errors = e.getErrors();
            Log.d("CreateBusiness", errors.toString());
        }
        return null;
    }

    @Override
    protected void onPostExecute(final Void __) {
        for (Listener listener : listeners) {
            if (errors == null)
                listener.onSuccess(business);
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