package com.myjobpitch.activities;

import android.app.LoaderManager.LoaderCallbacks;
import android.content.Context;
import android.content.CursorLoader;
import android.content.Intent;
import android.content.Loader;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.text.Editable;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.BuildConfig;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;


/**
 * A login screen that offers login via email/password.
 */
public class LoginActivity extends MJPProgressActivity implements LoaderCallbacks<Cursor> {
    private static final String LOGIN_PREFERENCES = "LoginPreferences";
    private static final String API_ROOT = "API_ROOT";
    private static final String USERNAME = "USERNAME";
    private static final String PASSWORD = "PASSWORD";
    private static final String REMEMBER_PASSWORD = "REMEMBER_PASSWORD";


    private LoginTask loginTask = null;
    private LogoutTask logoutTask = null;

    // UI references.
    private AutoCompleteTextView mUsernameView;
    private EditText mPasswordView;
    private CheckBox mRememberPasswordView;
    private View mProgressView;
    private TextView mProgressText;
    private View mLoginFormView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        final SharedPreferences preferences = getSharedPreferences(LOGIN_PREFERENCES, MODE_PRIVATE);

        // Display version
        String version = "unknown";
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            version = packageInfo.versionName;

        } catch (PackageManager.NameNotFoundException e) {}
        TextView versionView = (TextView) findViewById(R.id.version);
        versionView.setText(String.format("Version: %s", version));

        // Set up the login form.
        mUsernameView = (AutoCompleteTextView) findViewById(R.id.username);
        mUsernameView.setText(preferences.getString(USERNAME, ""));

        mPasswordView = (EditText) findViewById(R.id.password);
        mPasswordView.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                attemptLogin();
                return true;
            }
        });

        mRememberPasswordView = (CheckBox)findViewById(R.id.remember_password);
        mRememberPasswordView.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (!isChecked)
                    preferences.edit().remove(REMEMBER_PASSWORD).commit();
            }
        });
        if (preferences.getBoolean(REMEMBER_PASSWORD, false)) {
            mPasswordView.setText(preferences.getString(PASSWORD, ""));
            mRememberPasswordView.setChecked(true);
        }

        Button mSignInButton = (Button) findViewById(R.id.sign_in_button);
        mSignInButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptLogin();
            }
        });

        Button mRegisterButton = (Button) findViewById(R.id.register_button);
        mRegisterButton.setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                register();
            }
        });

        mLoginFormView = findViewById(R.id.login_form);
        mProgressView = findViewById(R.id.progress);
        mProgressText = (TextView) findViewById(R.id.progress_text);

        if (BuildConfig.DEBUG) {
            versionView.setText(String.format("Version: %s (DEBUG)", version));
            versionView.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
            findViewById(R.id.debug).setVisibility(View.VISIBLE);
            String urls[] = new String[] {
                    "http://ec2-52-31-145-95.eu-west-1.compute.amazonaws.com/",
                    "http://mjp.digitalcrocodile.com:8000/",
                    "http://mjp.digitalcrocodile.com:8001/",
                    "http://mjp.digitalcrocodile.com/",
                    "http://localhost:8000/",
            };
            ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, urls);
            AutoCompleteTextView apiRootView = (AutoCompleteTextView) findViewById(R.id.debug_api);
            apiRootView.setAdapter(adapter);
            apiRootView.addTextChangedListener(new TextWatcher() {
                @Override
                public void beforeTextChanged(CharSequence s, int start, int count, int after) {
                }

                @Override
                public void onTextChanged(CharSequence s, int start, int before, int count) {
                    getApi().setApiRoot(s.toString());
                }

                @Override
                public void afterTextChanged(Editable s) {
                }
            });
            apiRootView.setText(preferences.getString(API_ROOT, urls[0]));
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (!BuildConfig.DEBUG)
            mPasswordView.setText("");
    }

    @Override
    protected void onResume() {
        super.onResume();
        MJPApi api = ((MJPApplication) this.getApplication()).getApi();
        if (api.isAuthenticated()) {
            logoutTask = new LogoutTask();
            logoutTask.execute((Void) null);
        }
    }

    private void populateAutoComplete() {
        getLoaderManager().initLoader(0, null, this);
    }


    /**
     * Attempts to sign in or register the account specified by the login form.
     * If there are form errors (invalid email, missing fields, etc.), the
     * errors are presented and no actual login attempt is made.
     */
    public void attemptLogin() {
        if (logoutTask != null) {
            return;
        }

        // Reset errors.
        mUsernameView.setError(null);
        mPasswordView.setError(null);

        // Store values at the time of the login attempt.
        String username = mUsernameView.getText().toString();
        String password = mPasswordView.getText().toString();

        boolean error = false;
        View errorView = null;


        // Check for a valid password, if the user entered one.
        if (TextUtils.isEmpty(password)) {
            mPasswordView.setError(getString(R.string.error_field_required));
            errorView = mPasswordView;
            error = true;
        }

        // Check for a valid email address.
        if (TextUtils.isEmpty(username)) {
            mUsernameView.setError(getString(R.string.error_field_required));
            errorView = mUsernameView;
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
            mProgressText.setText(getString(R.string.logging_in));
            loginTask = new LoginTask(username, password);
            loginTask.execute((Void) null);
        }
    }

    private void register() {
        Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
        intent.putExtra("username", mUsernameView.getText().toString());
        startActivity(intent);
    }

    @Override
    public Loader<Cursor> onCreateLoader(int i, Bundle bundle) {
        return new CursorLoader(this,
                // Retrieve data rows for the device user's 'profile' contact.
                Uri.withAppendedPath(ContactsContract.Profile.CONTENT_URI,
                        ContactsContract.Contacts.Data.CONTENT_DIRECTORY), ProfileQuery.PROJECTION,

                // Select only email addresses.
                ContactsContract.Contacts.Data.MIMETYPE +
                        " = ?", new String[]{ContactsContract.CommonDataKinds.Email
                .CONTENT_ITEM_TYPE},

                // Show primary email addresses first. Note that there won't be
                // a primary email address if the user hasn't specified one.
                ContactsContract.Contacts.Data.IS_PRIMARY + " DESC");
    }

    @Override
    public void onLoadFinished(Loader<Cursor> cursorLoader, Cursor cursor) {
        List<String> emails = new ArrayList<>();
        cursor.moveToFirst();
        while (!cursor.isAfterLast()) {
            emails.add(cursor.getString(ProfileQuery.ADDRESS));
            cursor.moveToNext();
        }

        addEmailsToAutoComplete(emails);
    }

    @Override
    public void onLoaderReset(Loader<Cursor> cursorLoader) {

    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mLoginFormView;
    }

    private interface ProfileQuery {
        String[] PROJECTION = {
                ContactsContract.CommonDataKinds.Email.ADDRESS,
                ContactsContract.CommonDataKinds.Email.IS_PRIMARY,
        };

        int ADDRESS = 0;
        int IS_PRIMARY = 1;
    }

    private void addEmailsToAutoComplete(List<String> emailAddressCollection) {
        //Create adapter to tell the AutoCompleteTextView what to show in its dropdown list.
        ArrayAdapter<String> adapter =
                new ArrayAdapter<>(LoginActivity.this,
                        android.R.layout.simple_dropdown_item_1line, emailAddressCollection);

        mUsernameView.setAdapter(adapter);
    }

    class LoginTask extends AsyncTask<Void, Void, Boolean> {

        private final String mUsername;
        private final String mPassword;
        private boolean clientException = false;
        private boolean loadError = false;
        private User mUser;
        private Business mBusiness;

        LoginTask(String username, String password) {
            mUsername = username;
            mPassword = password;
        }

        @Override
        protected Boolean doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                try {
                    api.login(mUsername, mPassword);
                } catch (MJPApiException e) {
                    return false;
                }
                try {
                    // Load user data
                    mUser = api.getUser();
                    mBusiness = null;
                    if (mUser.isRecruiter())
                        if (mUser.getBusinesses().size() == 1)
                            mBusiness = api.getUserBusiness(mUser.getBusinesses().get(0));

                    return true;
                } catch (Exception e) {
                    api.logout();
                    throw e;
                }
            } catch (RestClientException e) {
                e.printStackTrace();
                clientException = true;
            }
            return false;
        }

        @Override
        protected void onPostExecute(final Boolean loginSuccess) {
            if (loginSuccess) {
                SharedPreferences.Editor preferences = getSharedPreferences(LOGIN_PREFERENCES, MODE_PRIVATE)
                        .edit()
                        .putString(USERNAME, mUsername)
                        .putString(PASSWORD, mPassword)
                        .putBoolean(REMEMBER_PASSWORD, mRememberPasswordView.isChecked());
                if (BuildConfig.DEBUG)
                    preferences.putString(API_ROOT, getApi().getApiRoot());
                preferences.commit();

                final List<APITask<Boolean>> tasks = getMJPApplication().getLoadActions();

                final AtomicInteger progress = new AtomicInteger();
                final Integer progressInterval = 100/tasks.size();
                mProgressText.setText(getString(R.string.loading_data, progress));

                InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
                imm.hideSoftInputFromWindow(mLoginFormView.getWindowToken(), 0);

                BackgroundTaskManager taskManager = new BackgroundTaskManager();
                taskManager.addTaskCompletionAction(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            if (loadError) {
                                Toast toast = Toast.makeText(LoginActivity.this, "Error loading application data", Toast.LENGTH_LONG);
                                toast.show();
                                LogoutTask logout = new LogoutTask();
                                logout.execute();
                                showProgress(false);
                            } else {
                                Log.d("LoginActivity", "application data loaded");
                                Intent intent;
                                if (mUser.isRecruiter()) {
                                    if (mUser.getBusinesses().size() == 1) {
                                        if (mBusiness.getLocations().isEmpty()) {
                                            // Business but no location: still creating profile
                                            ObjectMapper mapper = new ObjectMapper();
                                            intent = new Intent(LoginActivity.this, CreateProfileActivity.class);
                                            intent.putExtra("business_data", mapper.writeValueAsString(mBusiness));
                                        } else if (mBusiness.getLocations().size() == 1) {
                                            // Single business and single location: go straight to location
                                            intent = new Intent(LoginActivity.this, JobListActivity.class);
                                            intent.putExtra(JobListActivity.LOCATION_ID, mBusiness.getLocations().get(0));
                                        } else {
                                            // Single business, multiple locations: go straight to business
                                            intent = new Intent(LoginActivity.this, LocationListActivity.class);
                                            intent.putExtra(LocationListActivity.BUSINESS_ID, mBusiness.getId());
                                        }
                                    } else {
                                        // Multiple businesses: goto business list
                                        intent = new Intent(LoginActivity.this, BusinessListActivity.class);
                                    }
                                } else if (mUser.isJobSeeker()) {
                                    // JobSeeker: goto job seeker screen
                                    intent = new Intent(LoginActivity.this, JobSeekerActivity.class);
                                } else {
                                    // NO businesses or job seeker profile
                                    intent = new Intent(LoginActivity.this, CreateProfileActivity.class);
                                }
                                intent.putExtra("from_login", true);
                                startActivity(intent);
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                            LogoutTask logout = new LogoutTask();
                            logout.execute();
                            showProgress(false);
                        } finally{
                            loginTask = null;
                        }
                    }
                });
                for (APITask<Boolean> task : tasks) {
                    task.addListener(new APITaskListener<Boolean>() {
                        @Override
                        public void onPostExecute(Boolean result) {
                            mProgressText.setText(getString(R.string.loading_data, progress.addAndGet(progressInterval)));
                            if (!result) {
                                for (APITask<Boolean> task : tasks)
                                    task.cancel(true);
                                loadError = true;
                            }
                        }

                        @Override
                        public void onCancelled() {
                            Log.d("LoginActivity", "load data task cancelled");
                        }
                    });
                    taskManager.addBackgroundTask(task);
                }
                ExecutorService executor = Executors.newFixedThreadPool(5);
                for (APITask<Boolean> task : tasks)
                    task.executeOnExecutor(executor);
                executor.shutdown();
            } else if (clientException) {
                loginTask = null;
                Toast toast = Toast.makeText(LoginActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                showProgress(false);
            } else {
                loginTask = null;
                mPasswordView.setError(getString(R.string.error_incorrect_password));
                mPasswordView.requestFocus();
                showProgress(false);
            }
        }

        @Override
        protected void onCancelled() {
            loginTask = null;
            showProgress(false);
        }
    }

    public class LogoutTask extends AsyncTask<Void, Void, Void> {
        @Override
        protected Void doInBackground(Void... params) {
            MJPApi api = ((MJPApplication)getApplication()).getApi();
            try {
                api.logout();
            } catch (Exception e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Void __) {
            logoutTask = null;
            showProgress(false);
        }

        @Override
        protected void onCancelled() {
            logoutTask = null;
            showProgress(false);
        }
    }
}
