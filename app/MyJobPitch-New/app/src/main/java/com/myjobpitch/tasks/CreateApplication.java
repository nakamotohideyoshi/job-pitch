package com.myjobpitch.tasks;

import android.os.AsyncTask;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Loading;

public class CreateApplication extends AsyncTask<Void, Void, Application> {

    Integer jobId;
    Integer jobSeekerId;
    TaskListener listener;
    String error = "";

    public CreateApplication(Integer jobId, Integer jobSeekerId, TaskListener listener) {
        this.jobId = jobId;
        this.jobSeekerId = jobSeekerId;
        this.listener = listener;
        Loading.show(null);
        execute();
    }

    @Override
    protected Application doInBackground(Void... params) {
        ApplicationForCreation application = new ApplicationForCreation();
        application.setJob(jobId);
        application.setJob_seeker(jobSeekerId);
        application.setShortlisted(false);
        try {
            application = MJPApi.shared().create(ApplicationForCreation.class, application);
            return MJPApi.shared().get(Application.class, application.getId());
        } catch (MJPApiException e) {
            JsonNode errors = e.getErrors();
            if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                error = "NO_TOKENS";
            }
            return null;
        }
    }
    @Override
    protected void onPostExecute(Application application) {
        Loading.hide();
        if (listener != null) {
            if (application != null) {
                listener.done(application);
            } else {
                listener.error(error);
            }
        }
    }

}
