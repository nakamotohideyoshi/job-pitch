package com.myjobpitch.activities;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.api.client.extensions.android.http.AndroidHttp;
import com.google.api.client.googleapis.extensions.android.gms.auth.GoogleAccountCredential;
import com.google.api.client.googleapis.extensions.android.gms.auth.GooglePlayServicesAvailabilityIOException;
import com.google.api.client.googleapis.extensions.android.gms.auth.UserRecoverableAuthIOException;

import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.ExponentialBackOff;

import com.google.api.services.drive.DriveScopes;

import com.google.api.services.drive.model.*;
import com.google.api.services.drive.model.File;
import com.myjobpitch.R;
import com.myjobpitch.views.Popup;

import android.Manifest;
import android.accounts.AccountManager;
import android.app.Dialog;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import pub.devrel.easypermissions.AfterPermissionGranted;
import pub.devrel.easypermissions.EasyPermissions;

public class GoogleDriveActivity extends AppCompatActivity implements EasyPermissions.PermissionCallbacks {

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.file_list)
    ListView listView;

    FilesAdapter adapter;

    String folderIconLink;
    ArrayList<String> arrPath = new ArrayList<>();
    String mimeQuery = null;
    String account;

    GoogleAccountCredential mCredential;
    com.google.api.services.drive.Drive mService = null;

    File selectedFile;

    static final int REQUEST_ACCOUNT_PICKER = 1000;
    static final int REQUEST_AUTHORIZATION = 1001;
    static final int REQUEST_GOOGLE_PLAY_SERVICES = 1002;
    static final int REQUEST_PERMISSION_GET_ACCOUNTS = 1003;

    static final String[] SCOPES = { DriveScopes.DRIVE_READONLY };
    static final int PERMISSION_WRITE_EXTERNAL_STORAGE = 11000;

    /**
     * Create the main activity.
     * @param savedInstanceState previously saved instance data.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_google_drive);
        ButterKnife.bind(this);

        if (getIntent().getBooleanExtra("onlyImage", false)) {
            mimeQuery = "mimeType = 'image/png' or mimeType = 'image/jpeg'";
        }

        mToolbar.setNavigationIcon(R.drawable.ic_back);
        mToolbar.setTitle(R.string.google_drive);
        setSupportActionBar(mToolbar);

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (arrPath.size() > 0) {
                new GetFilesTask().execute();
            } else {
                swipeRefreshLayout.setRefreshing(false);
            }
        });

        // list view

        if (adapter == null) {
            adapter = new FilesAdapter(this, new ArrayList<>());
        } else {
            adapter.clear();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view, position, id) -> {
            final File file = adapter.getItem(position);
            if (file.getMimeType().equals("application/vnd.google-apps.folder")) {
                String fileId = file.getId();
                if (fileId != null) {
                    arrPath.add(fileId);
                    if (folderIconLink == null) {
                        folderIconLink = file.getIconLink();
                    }
                } else {
                    arrPath.remove(arrPath.size()-1);
                }
                adapter.clear();
                new GetFilesTask().execute();
            } else {
                try {
                    if (file.getSize() > 0) {
                        String title = String.format(getString(R.string.download_message), file.getName());
                        Popup popup = new Popup(GoogleDriveActivity.this, title, true);
                        popup.addGreenButton(R.string.download, v -> {
                            selectedFile = file;
                            download();
                        });
                        popup.addGreyButton(R.string.cancel, null);
                        popup.show();
                    }
                } catch (Exception e) {
                }
            }
        });

        if (mCredential == null) {
            // Initialize credentials and service object.
            mCredential = GoogleAccountCredential.usingOAuth2(
                    getApplicationContext(), Arrays.asList(SCOPES))
                    .setBackOff(new ExponentialBackOff());

            HttpTransport transport = AndroidHttp.newCompatibleTransport();
            JsonFactory jsonFactory = JacksonFactory.getDefaultInstance();
            mService = new com.google.api.services.drive.Drive.Builder(
                    transport, jsonFactory, mCredential)
                    .setApplicationName("My Job Pitch")
                    .build();

            SharedPreferences prefs = getSharedPreferences("googledrive", MODE_PRIVATE);
            account = prefs.getString("account", null);
            getRootDir(true);
        }

    }

    private void getRootDir(boolean switchAccountRequest) {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        final int connectionStatusCode = apiAvailability.isGooglePlayServicesAvailable(this);
        if (connectionStatusCode != ConnectionResult.SUCCESS) {
            if (apiAvailability.isUserResolvableError(connectionStatusCode)) {
                showGooglePlayServicesAvailabilityErrorDialog(connectionStatusCode);
            }
        } else if (switchAccountRequest || mCredential.getSelectedAccountName() == null) {
            chooseAccount();
        } else if (! isDeviceOnline()) {
            Popup popup = new Popup(this, R.string.error_no_connection, true);
            popup.addGreyButton(R.string.ok, null);
            popup.show();
        } else {
            SharedPreferences prefs = getSharedPreferences("googledrive", MODE_PRIVATE);
            prefs.edit().putString("account", mCredential.getSelectedAccountName()).apply();
            adapter.clear();
            arrPath.add("root");
            new GetFilesTask().execute();
        }
    }

    @AfterPermissionGranted(REQUEST_PERMISSION_GET_ACCOUNTS)
    private void chooseAccount() {
        if (EasyPermissions.hasPermissions(this, Manifest.permission.GET_ACCOUNTS)) {
            if (account != null) {
                mCredential.setSelectedAccountName(account);
                if (mCredential.getSelectedAccountName() != null) {
                    account = null;
                    getRootDir(false);
                    return;
                }
            }
            // Start a dialog from which the user can choose an account
            startActivityForResult(mCredential.newChooseAccountIntent(), REQUEST_ACCOUNT_PICKER);
        } else {
            // Request the GET_ACCOUNTS permission via a user dialog
            EasyPermissions.requestPermissions(this,
                    getString(R.string.google_drive_permission),
                    REQUEST_PERMISSION_GET_ACCOUNTS,
                    Manifest.permission.GET_ACCOUNTS);
        }
    }

    private boolean isDeviceOnline() {
        ConnectivityManager connMgr = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
        return (networkInfo != null && networkInfo.isConnected());
    }

    @Override
    protected void onActivityResult(
            int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        switch(requestCode) {
            case REQUEST_GOOGLE_PLAY_SERVICES:
                if (resultCode != RESULT_OK) {
                    Popup popup = new Popup(this, R.string.google_drive_permission_error, true);
                    popup.addGreyButton(R.string.ok, null);
                    popup.show();
                } else {
                    getRootDir(true);
                }
                break;
            case REQUEST_ACCOUNT_PICKER:
                if (resultCode == RESULT_OK && data != null && data.getExtras() != null) {
                    String accountName = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
                    if (accountName != null) {
                        mCredential.setSelectedAccountName(accountName);
                        account = null;
                        getRootDir(false);
                    }
                }
                break;
            case REQUEST_AUTHORIZATION:
                if (resultCode == RESULT_OK) {
                    getRootDir(false);
                }
                break;
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        if (requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE) {
            for (int permission : grantResults) {
                if (permission != PackageManager.PERMISSION_GRANTED) {
                    return;
                }
            }
            new DownloadTask().execute();
        } else {
            EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
        }
    }

    @Override
    public void onPermissionsGranted(int requestCode, List<String> list) {
        // Do nothing.
    }

    @Override
    public void onPermissionsDenied(int requestCode, List<String> list) {
        // Do nothing.
    }


    void showGooglePlayServicesAvailabilityErrorDialog(
            final int connectionStatusCode) {
        GoogleApiAvailability apiAvailability = GoogleApiAvailability.getInstance();
        Dialog dialog = apiAvailability.getErrorDialog(
                GoogleDriveActivity.this,
                connectionStatusCode,
                REQUEST_GOOGLE_PLAY_SERVICES);
        dialog.show();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuItem item = menu.add(Menu.NONE, 100, 1, R.string.accounts);
        item.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == android.R.id.home) {
            finish();
        } else if (id == 100) {
            getRootDir(true);
        }
        return super.onOptionsItemSelected(item);
    }

    /**
     * An asynchronous task that handles the Drive API call.
     * Placing the API calls in their own task ensures the UI stays responsive.
     */
    private class GetFilesTask extends AsyncTask<Void, Void, List<File>> {

        private Exception mLastError = null;

        @Override
        protected List<File> doInBackground(Void... params) {
            try {
                String q = String.format("'%s' in parents", arrPath.get(arrPath.size()-1));
                if (mimeQuery != null) {
                    q = String.format("%s and (mimeType = 'application/vnd.google-apps.folder' or %s)", q, mimeQuery);
                }
                FileList result = mService.files().list()
                        .setPageSize(1000)
                        .setQ(q)
                        .setOrderBy("folder,name")
                        .setFields("nextPageToken,files(mimeType,id,name,size)")
                        .execute();
                List<File> files = result.getFiles();
                return files;
            } catch (Exception e) {
                mLastError = e;
                return null;
            }
        }

        @Override
        protected void onPreExecute() {
            swipeRefreshLayout.setRefreshing(true);
        }

        @Override
        protected void onPostExecute(List<File> files) {
            swipeRefreshLayout.setRefreshing(false);
            if (files != null) {
                adapter.clear();
                if (arrPath.size() > 1) {
                    File file = new File();
                    file.setName("..");
                    file.setIconLink(folderIconLink);
                    file.setMimeType("application/vnd.google-apps.folder");
                    adapter.add(file);
                }
                adapter.addAll(files);
            } else {
                if (mLastError instanceof GooglePlayServicesAvailabilityIOException) {
                    showGooglePlayServicesAvailabilityErrorDialog(
                            ((GooglePlayServicesAvailabilityIOException) mLastError)
                                    .getConnectionStatusCode());
                } else if (mLastError instanceof UserRecoverableAuthIOException) {
                    startActivityForResult(
                            ((UserRecoverableAuthIOException) mLastError).getIntent(),
                            GoogleDriveActivity.REQUEST_AUTHORIZATION);
                } else {
                    Popup popup = new Popup(GoogleDriveActivity.this, R.string.error_no_connection, true);
                    popup.addGreyButton(R.string.ok, null);
                    popup.show();
                }
            }
        }

    }

    void download() {
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            String[] permissions = {android.Manifest.permission.WRITE_EXTERNAL_STORAGE};
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_WRITE_EXTERNAL_STORAGE);
        } else {
            new DownloadTask().execute();
        }
    }

    private class DownloadTask extends AsyncTask<Void, Void, String> {

        private Exception mLastError;

        @Override
        protected String doInBackground(Void... params) {

            java.io.File dir = new java.io.File(Environment.getExternalStorageDirectory(), "MyJobPitch");
            if (!dir.exists()) {
                dir.mkdirs();
            }
            java.io.File file = new java.io.File(dir, selectedFile.getName().replace(" ", ""));
            try {
                OutputStream outStream = new FileOutputStream(file);
                mService.files().get(selectedFile.getId())
                        .executeMediaAndDownloadTo(outStream);
                outStream.flush();
                outStream.close();
                return file.getAbsolutePath();
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }

        @Override
        protected void onPreExecute() {
//            Loading.show(GoogleDriveActivity.this, "Downloading...");
        }

        @Override
        protected void onPostExecute(String path) {
//            Loading.hide();
            if (path != null) {
                Intent intent = new Intent();
                intent.putExtra("path", path);
                setResult(RESULT_OK, intent);
                finish();
            }
        }

    }

    private class FilesAdapter extends ArrayAdapter<File> {

        public FilesAdapter(Context context, List<File> files) {
            super(context, 0, files);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if(convertView == null){
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_file_list, parent, false);
            }

            File file = getItem(position);

            int icon = R.drawable.g_file;
            String mimeType = file.getMimeType();
            if (mimeType.equals("application/vnd.google-apps.folder")) {
                icon = R.drawable.g_folder;
            } else {
                if (mimeType.equals("image/jpeg") || mimeType.equals("image/png")) {
                    icon = R.drawable.g_image;
                } else if(mimeType.equals("application/pdf")) {
                    icon = R.drawable.g_pdf;
                }
            }
            ImageView iconView = convertView.findViewById(R.id.image_view);
            iconView.setBackgroundColor(Color.TRANSPARENT);
            iconView.setImageResource(icon);

            TextView nameView = convertView.findViewById(R.id.file_name);
            nameView.setText(file.getName());

            TextView attributesView = convertView.findViewById(R.id.file_attributes);
            try {
                long size = file.getSize();
                if (size < 1024) {
                    attributesView.setText(size + " Bytes");
                } else if (size < 1024*1024) {
                    attributesView.setText((int)size/1024 + " KB");
                } else if (size < 1024*1024*1024) {
                    attributesView.setText((int)size/1024/1024 + " MB");
                } else {
                    attributesView.setText((int)size/1024/1024/1024 + " GB");
                }
            } catch (Exception e) {
                attributesView.setText("");
            }

            return convertView;
        }
    }

}
