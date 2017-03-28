package com.myjobpitch.tasks;

import android.os.AsyncTask;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.utils.AppHelper;

public class DeleteApplication extends AsyncTask<Void, Void, Boolean> {
    Integer applicationId;
    TaskListener listener;

    public DeleteApplication(Integer applicationId, TaskListener listener) {
        this.applicationId = applicationId;
        this.listener = listener;
        AppHelper.showLoading(null);
        execute();
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        try {
            MJPApi.shared().delete(Application.class, applicationId);
            return true;
        } catch (MJPApiException e) {
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
                listener.error("");
            }
        }
    }
}
