package com.myjobpitch.tasks;

import android.os.AsyncTask;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.utils.AppHelper;

import org.apache.commons.lang3.SerializationUtils;

public class UpdateApplication extends AsyncTask<Void, Void, Boolean> {

    Application application;
    TaskListener listener;
    String error = "";

    public UpdateApplication(Application application, Integer status, TaskListener listener) {
        this.application = SerializationUtils.clone(application);
        this.application.setStatus(status);
        this.listener = listener;
        AppHelper.showLoading(null);
        execute();
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        try {
            ApplicationStatusUpdate update = new ApplicationStatusUpdate(application);
            MJPApi.shared().updateApplicationStatus(update);
            return true;
        } catch (MJPApiException e) {
            JsonNode errors = e.getErrors();
            if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                error = "NO_TOKENS";
            }
            return false;
        }
    }
    @Override
    protected void onPostExecute(Boolean success) {
        AppHelper.hideLoading();
        if (listener != null) {
            if (success) {
                listener.done(success);
            } else {
                listener.error(error);
            }
        }
    }

}
