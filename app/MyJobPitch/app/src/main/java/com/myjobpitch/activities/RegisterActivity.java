package com.myjobpitch.activities;

import android.content.Context;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class RegisterActivity extends MJPProgressActivity {

    private EditText mUsernameView;
    private EditText mPassword1View;
    private EditText mPassword2View;
    private View mRegisterFormView;
    private View mProgressView;
    private RegisterTask registerTask;
    private TextView mProgressText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        mUsernameView = (EditText) findViewById(R.id.username);
        mPassword1View = (EditText) findViewById(R.id.password1);
        mPassword2View = (EditText) findViewById(R.id.password2);
        mPassword2View.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                attemptRegistration();
                return true;
            }
        });

        String username = getIntent().getStringExtra("username");
        if (username != null) {
            mUsernameView.setText(username);
        }

        Button mSignInButton = (Button) findViewById(R.id.register_button);
        mSignInButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptRegistration();
            }
        });

        mRegisterFormView = findViewById(R.id.register_form);
        mProgressView = findViewById(R.id.progress);
        mProgressText = (TextView) findViewById(R.id.progress_text);
    }

    private void attemptRegistration() {
        // Reset errors.
        mUsernameView.setError(null);
        mPassword1View.setError(null);
        mPassword2View.setError(null);

        boolean error = false;
        View errorView = null;

        // Store values at the time of the login attempt.
        String username = mUsernameView.getText().toString();
        String password1 = mPassword1View.getText().toString();
        String password2 = mPassword2View.getText().toString();

        if (TextUtils.isEmpty(username)) {
            mUsernameView.setError(getString(R.string.error_field_required));
            errorView = mUsernameView;
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

        if (error) {
            // There was an error; don't attempt login and focus the first
            // form field with an error.
            errorView.requestFocus();
        } else {
            // Show a progress spinner, and kick off a background task to
            // perform the user login attempt.
            showProgress(true);
            mProgressText.setText(getString(R.string.creating_account));
            registerTask = new RegisterTask(username, password1, password2);
            registerTask.execute((Void) null);
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
        return mRegisterFormView;
    }

    private class RegisterTask extends AsyncTask<Void, Void, Class<?>> {
        private final String username;
        private final String password1;
        private final String password2;
        private JsonNode errors;
        private boolean loadError = false;
        private boolean clientException = false;

        public RegisterTask(String username, String password1, String password2) {
            this.username = username;
            this.password1 = password1;
            this.password2 = password2;
        }

        @Override
        protected Class<?> doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                try {
                    api.register(username, password1, password2);
                } catch (MJPApiException e) {
                    errors = e.getErrors();
                    return null;
                }

                try {
                    api.getUser();
                } catch (Exception e) {
                    api.logout();
                }
                return CreateProfileActivity.class;
            } catch (RestClientException e) {
                e.printStackTrace();
                clientException = true;
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Class<?> next) {
            registerTask = null;
            if (errors != null) {
                View errorView = null;
                JsonNode generalError = errors.get("__all__");
                if (generalError != null) {
                    mPassword2View.setError(generalError.get(0).asText());
                    errorView = mPassword2View;
                }

                JsonNode password2Error = errors.get("password2");
                if (password2Error != null) {
                    mPassword2View.setError(password2Error.get(0).asText());
                    errorView = mPassword2View;
                }

                JsonNode password1Error = errors.get("password1");
                if (password1Error != null) {
                    mPassword1View.setError(password1Error.get(0).asText());
                    errorView = mPassword1View;
                }

                JsonNode usernameError = errors.get("username");
                if (usernameError != null) {
                    mUsernameView.setError(usernameError.get(0).asText());
                    errorView = mUsernameView;
                }

                if (errorView != null)
                    errorView.requestFocus();
                showProgress(false);

            } else if (clientException) {
                Toast toast = Toast.makeText(RegisterActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                showProgress(false);
            } else {
                List<APITask<Boolean>> tasks = getMJPApplication().getLoadActions();

                final AtomicInteger progress = new AtomicInteger();
                final Integer progressInterval = 100/tasks.size();
                mProgressText.setText(getString(R.string.loading_data, progress));

                InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(mRegisterFormView.getWindowToken(), 0);

                BackgroundTaskManager taskManager = new BackgroundTaskManager();
                taskManager.addTaskCompletionAction(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            if (loadError) {
                                Toast toast = Toast.makeText(RegisterActivity.this, "Error loading application data", Toast.LENGTH_LONG);
                                toast.show();
                                showProgress(false);
                            } else {
                                Log.d("LoginActivity", "application data loaded");
                                Intent intent = new Intent(RegisterActivity.this, next);
                                intent.putExtra("from_login", true);
                                startActivity(intent);
                            }
                        } finally{
                            registerTask = null;
                        }
                    }
                });
                for (APITask<Boolean> task : tasks) {
                    task.addListener(new APITaskListener<Boolean>() {
                        @Override
                        public void onPostExecute(Boolean result) {
                            mProgressText.setText(getString(R.string.loading_data, progress.addAndGet(progressInterval)));
                            if (!result)
                                loadError = true;
                        }

                        @Override
                        public void onCancelled() {
                            Log.d("RegisterActivity", "load data task cancelled");
                        }
                    });
                    taskManager.addBackgroundTask(task);
                }
                for (APITask<Boolean> task : tasks)
                    task.execute();
            }
        }

        @Override
        protected void onCancelled() {
            registerTask = null;
            showProgress(false);
        }
    }

}
