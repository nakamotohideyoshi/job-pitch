package com.myjobpitch.activities;

import android.app.LoaderManager.LoaderCallbacks;
import android.content.CursorLoader;
import android.content.Intent;
import android.content.Loader;
import android.database.Cursor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.provider.ContactsContract;
import android.text.TextUtils;
import android.view.KeyEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.inputmethod.EditorInfo;
import android.widget.ArrayAdapter;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Business;

import org.springframework.web.client.HttpClientErrorException;

import java.util.ArrayList;
import java.util.List;


/**
 * A login screen that offers login via email/password.
 */
public class LoginActivity extends MJPProgressActivity implements LoaderCallbacks<Cursor> {
    /**
     * Keep track of the login task to ensure we can cancel it if requested.
     */
    private LoginTask loginTask = null;
    private LogoutTask logoutTask = null;

    // UI references.
    private AutoCompleteTextView mUsernameView;
    private EditText mPasswordView;
    private View mProgressView;
    private View mLoginFormView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        // Set up the login form.
        mUsernameView = (AutoCompleteTextView) findViewById(R.id.username);
        populateAutoComplete();

        mPasswordView = (EditText) findViewById(R.id.password);
        mPasswordView.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView textView, int id, KeyEvent keyEvent) {
                if (id == R.id.login || id == EditorInfo.IME_NULL) {
                    attemptLogin();
                    return true;
                }
                return false;
            }
        });

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
        mProgressView = findViewById(R.id.login_progress);
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
    }

    @Override
    protected void onResume() {
        super.onResume();
        mPasswordView.setText("");
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

    public class LoginTask extends AsyncTask<Void, Void, Intent> {

        private final String mUsername;
        private final String mPassword;

        LoginTask(String username, String password) {
            mUsername = username;
            mPassword = password;
        }

        @Override
        protected Intent doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                api.login(mUsername, mPassword);
            } catch (HttpClientErrorException e) {
                // Invalid credentials
                if (e.getStatusCode().value() == 400)
                    return null;
            }

            try {
                // Load basic data
                application.setSectors(api.getSectors());
                application.setContracts(api.getContracts());
                application.setHours(api.getHours());
                application.setNationalities(api.getNationalities());
                application.setApplicationStatuses(api.getApplicationStatuses());
                application.setJobStatuses(api.getJobStatuses());
                application.setSexes(api.getSexes());

                // Load user data
                User user = api.getUser();
                if (user.isRecruiter()) {
                    if (user.getBusinesses().size() == 1) {
                        Business business = api.getUserBusiness(user.getBusinesses().get(0));
                        if (business.getLocations().isEmpty()) {
                            // Business but no location: still creating profile
                            ObjectMapper mapper = new ObjectMapper();
                            Intent intent = new Intent(LoginActivity.this, CreateProfileActivity.class);
                            intent.putExtra("business_data", mapper.writeValueAsString(business));
                            return intent;
                        } else if (business.getLocations().size() == 1) {
                            // Single business and single location: go straight to location
                            return new Intent(LoginActivity.this, BusinessListActivity.class);
                        } else {
                            // Single business, multiple locations: go straight to business
                            return new Intent(LoginActivity.this, BusinessListActivity.class);
                        }
                    } else {
                        // Multiple businesses: goto business list
                        return new Intent(LoginActivity.this, BusinessListActivity.class);
                    }
                } else if (user.isJobSeeker()) {
                    // JobSeeker: goto job seeker screen
                    return new Intent(LoginActivity.this, JobSeekerActivity.class);
                }
                // NO businesses or job seeker profile
                Intent intent = new Intent(LoginActivity.this, CreateProfileActivity.class);
                return intent;
            } catch (Exception e) {
                e.printStackTrace();
                api.logout();
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Intent intent) {
            loginTask = null;

            if (intent != null) {
                intent.putExtra("from_login", true);
                startActivity(intent);
            } else {
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
