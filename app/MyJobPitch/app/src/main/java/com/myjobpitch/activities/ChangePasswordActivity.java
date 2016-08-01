package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.text.TextUtils;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.fragments.JobSeekerEditFragment;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadJobSeekerTask;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;

import org.springframework.web.client.RestClientException;
import org.w3c.dom.Text;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class ChangePasswordActivity extends MJPProgressActionBarActivity {

    private View mChangePasswordView;
    private View mProgressView;

    private EditText mPasswordView;
    private EditText mPassword1View;
    private EditText mPassword2View;

    private ChangePasswordTask chnageTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_change_password);

        mChangePasswordView = (View) findViewById(R.id.change_password);
        mProgressView = findViewById(R.id.progress);

        mPasswordView = (EditText) findViewById(R.id.password);
        mPassword1View = (EditText) findViewById(R.id.password1);
        mPassword2View = (EditText) findViewById(R.id.password2);

        Button changeButton = (Button) findViewById(R.id.change_password_button);
        changeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        showProgress(false);

    }

    private void attemptSave() {
        // Reset errors.
        mPasswordView.setError(null);
        mPassword1View.setError(null);
        mPassword2View.setError(null);

        boolean error = false;
        View errorView = null;

        // Store values at the time of the login attempt.
        String password = mPasswordView.getText().toString();
        String password1 = mPassword1View.getText().toString();
        String password2 = mPassword2View.getText().toString();

        if (TextUtils.isEmpty(password)) {
            mPasswordView.setError(getString(R.string.error_field_required));
            errorView = mPasswordView;
            error = true;
        }

        if (TextUtils.isEmpty(password1)) {
            mPassword1View.setError(getString(R.string.error_field_required));
            errorView = mPassword1View;
            error = true;
        }

        if (TextUtils.isEmpty(password2)) {
            mPassword2View.setError(getString(R.string.error_field_required));
            errorView = mPassword2View;
            error = true;
        }

        if (!error && !TextUtils.equals(password, LoginActivity.myPassword)) {
            mPasswordView.setError(getString(R.string.password_incorrect));
            errorView = mPasswordView;
            error = true;
        }

        if (error) {
            // There was an error; don't attempt login and focus the first
            // form field with an error.
            errorView.requestFocus();
        } else {
            // Show a progress spinner, and kick off a background task to
            // perform the user login attempt.
            showProgress(true);
            chnageTask = new ChangePasswordTask(password1, password2);
            chnageTask.execute((Void) null);
        }
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(ChangePasswordActivity.this);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mChangePasswordView;
    }

    private class ChangePasswordTask extends AsyncTask<Void, Void, Class<?>> {
        private final String password1;
        private final String password2;
        private JsonNode errors;
        private boolean loadError = false;
        private boolean clientException = false;

        public ChangePasswordTask(String password1, String password2) {
            this.password1 = password1;
            this.password2 = password2;
        }

        @Override
        protected Class<?> doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                try {
                    api.changePassword(password1, password2);
                } catch (MJPApiException e) {
                    errors = e.getErrors();
                    return null;
                }

                return Boolean.class;
            } catch (RestClientException e) {
                e.printStackTrace();
                clientException = true;
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Class<?> next) {
            chnageTask = null;
            if (errors != null) {
                View errorView = null;
                JsonNode generalError = errors.get("new_password2");
                if (generalError != null) {
                    mPassword2View.setError(generalError.get(0).asText());
                    errorView = mPassword2View;
                }

                if (errorView != null)
                    errorView.requestFocus();
                showProgress(false);
            } else if (clientException) {
                Toast toast = Toast.makeText(ChangePasswordActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                showProgress(false);
            } else {
                LoginActivity.myPassword = password1;
                ChangePasswordActivity.this.finish();
                Intent intent = NavUtils.getParentActivityIntent(ChangePasswordActivity.this);
                startActivity(intent);
            }
        }

        @Override
        protected void onCancelled() {
            chnageTask = null;
            showProgress(false);
        }
    }
}
