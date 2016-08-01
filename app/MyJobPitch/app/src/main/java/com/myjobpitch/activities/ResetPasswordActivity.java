package com.myjobpitch.activities;

import android.os.AsyncTask;
import android.os.Bundle;
import android.text.TextUtils;

import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

import org.springframework.web.client.RestClientException;

public class ResetPasswordActivity extends MJPProgressActivity {

    private EditText mEmailView;
    private View mResetFormView;
    private View mProgressView;
    private ResetTask resetTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reset_password);
        mEmailView = (EditText) findViewById(R.id.email);

        String email = getIntent().getStringExtra("email");
        if (email != null) {
            mEmailView.setText(email);
        }

        Button mResetButton = (Button) findViewById(R.id.reset_button);
        mResetButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptResetPassword();
            }
        });

        mResetFormView = findViewById(R.id.reset_form);
        mProgressView = findViewById(R.id.progress);
    }

    private void attemptResetPassword() {
        // Reset errors.
        mEmailView.setError(null);

        boolean error = false;
        View errorView = null;

        // Store values at the time of the login attempt.
        String email = mEmailView.getText().toString();

        if (TextUtils.isEmpty(email)) {
            mEmailView.setError(getString(R.string.error_field_required));
            errorView = mEmailView;
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
            resetTask = new ResetTask(email);
            resetTask.execute((Void) null);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        finish();
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mResetFormView;
    }

    private class ResetTask extends AsyncTask<Void, Void, Class<?>> {
        private final String email;
        private JsonNode errors;
        private boolean clientException = false;

        public ResetTask(String email) {
            this.email = email;
        }

        @Override
        protected Class<?> doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                try {
                    api.resetPassword(email);
                } catch (MJPApiException e) {
                    errors = e.getErrors();
                    return null;
                }
                return boolean.class;
            } catch (RestClientException e) {
                e.printStackTrace();
                clientException = true;
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Class success) {
            resetTask = null;
            if (errors != null) {
                View errorView = null;
                JsonNode emailError = errors.get("email");
                if (emailError != null) {
                    mEmailView.setError(emailError.get(0).asText());
                    errorView = mEmailView;
                }

                if (errorView != null)
                    errorView.requestFocus();
                showProgress(false);

            } else if (clientException) {
                Toast toast = Toast.makeText(ResetPasswordActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                showProgress(false);
            } else {
                finish();
            }
        }

        @Override
        protected void onCancelled() {
            resetTask = null;
            showProgress(false);
        }
    }

}
