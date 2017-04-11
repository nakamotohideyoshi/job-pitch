package com.myjobpitch.tasks;

import android.os.AsyncTask;

import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;

public abstract class APITask extends AsyncTask<Void, Void, Boolean> {

    private String loadingMsg;
    private ErrorListener errorListener;

    private MJPApiException error;
    private boolean connectionError = false;

    public APITask() {
        init(null, null);
    }

    public APITask(ErrorListener errorListener) {
        init(null, errorListener);
    }

    public APITask(String loadingMsg) {
        init(loadingMsg, null);
    }

    public APITask(String loadingMsg, ErrorListener errorListener) {
        init(loadingMsg, errorListener);
    }

    void init(String loadingMsg, ErrorListener errorListener) {
        this.errorListener = errorListener;
        if (loadingMsg != null) {
            this.loadingMsg = loadingMsg;
            Loading.show(loadingMsg);
        }
        execute();
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        try {
            runAPI();
            return true;
        } catch (MJPApiException e) {
            error = e;
        } catch (Exception e) {
            connectionError = true;
        }
        return false;
    }

    @Override
    protected void onPostExecute(Boolean success) {
        if (loadingMsg != null) {
            Loading.hide();
        }

        if (success) {
            onSuccess();
        } else if (error != null) {
            if (errorListener != null) {
                errorListener.onError(error);
            }
        } else {
            Popup.showError("Connection Error");
        }
    }

    protected abstract void runAPI() throws MJPApiException;
    protected abstract void onSuccess();

    public interface ErrorListener {
        void onError(MJPApiException e);
    }

}