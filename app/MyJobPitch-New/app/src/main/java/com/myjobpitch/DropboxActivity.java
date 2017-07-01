package com.myjobpitch;

import com.dropbox.core.DbxException;
import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.android.Auth;
import com.dropbox.core.http.OkHttp3Requestor;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.files.FileMetadata;
import com.dropbox.core.v2.files.FolderMetadata;
import com.dropbox.core.v2.files.ListFolderResult;
import com.dropbox.core.v2.files.Metadata;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Bundle;
import android.os.Environment;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import butterknife.BindView;
import butterknife.ButterKnife;

public class DropboxActivity extends AppCompatActivity {

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.file_list)
    ListView listView;

    MenuItem signButton;
    FilesAdapter adapter;
    ArrayList<String> arrPath = new ArrayList<>();
    DbxClientV2 dbxClient;
    boolean onlyImage = false;

    FileMetadata selectedFile;

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

        mToolbar.setNavigationIcon(R.drawable.ic_back);
        mToolbar.setTitle("Dropbox");
        setSupportActionBar(mToolbar);

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                if (dbxClient != null) {
                    new GetFilesTask().execute();
                } else {
                    swipeRefreshLayout.setRefreshing(false);
                }
            }
        });

        // list view

        if (adapter == null) {
            adapter = new FilesAdapter(this, new ArrayList<Metadata>());
        } else {
            adapter.clear();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                final Metadata metadata = adapter.getItem(position);
                if (metadata instanceof FolderMetadata) {
                    if (((FolderMetadata) metadata).getId().equals("back")) {
                        arrPath.remove(arrPath.size()-1);
                    } else {
                        arrPath.add(metadata.getName());
                    }
                    adapter.clear();
                    new GetFilesTask().execute();
                } else {
                    String title = String.format("Do you want to download %s?", metadata.getName());
                    new Popup(DropboxActivity.this, title, "Download", new View.OnClickListener() {
                        @Override
                        public void onClick(View v) {
                            selectedFile = (FileMetadata)metadata;
                            download();
                        }
                    }, "Cancel", null, true);
                }
            }
        });

        onlyImage = getIntent().getBooleanExtra("onlyImage", false);

    }

    @Override
    protected void onResume() {
        super.onResume();

        if (dbxClient == null) {
            SharedPreferences prefs = getSharedPreferences("dropbox", MODE_PRIVATE);
            String accessToken = prefs.getString("access-token", null);
            if (accessToken == null) {
                accessToken = Auth.getOAuth2Token();
                if (accessToken == null) {
                    return;
                }
                prefs.edit().putString("access-token", accessToken).apply();
            }

            DbxRequestConfig requestConfig = DbxRequestConfig.newBuilder("My Job Pitch")
                    .withHttpRequestor(new OkHttp3Requestor(OkHttp3Requestor.defaultOkHttpClient()))
                    .build();

            dbxClient = new DbxClientV2(requestConfig, accessToken);

            if (signButton != null) {
                signButton.setTitle("Sign out");
            }

            arrPath.clear();
            arrPath.add("");
            new GetFilesTask().execute();
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        signButton = menu.add(Menu.NONE, 100, 1, dbxClient == null ? "Sign in" : "Sign out");
        signButton.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == android.R.id.home) {
            finish();
        } else if (id == 100) {
            if (dbxClient == null) {
                Auth.startOAuth2Authentication(this, "gpwecvaun9wmvim");
            } else {
                try {
                    dbxClient = null;
                    adapter.clear();
                    signButton.setTitle("Sign in");
                    SharedPreferences prefs = getSharedPreferences("dropbox", MODE_PRIVATE);
                    prefs.edit().remove("access-token").apply();
                } catch (Exception e) {
                }
            }
        }

        return super.onOptionsItemSelected(item);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        for (int permission : grantResults) {
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }
        if (requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE) {
            new DownloadTask().execute();
        }
    }

    class GetFilesTask extends AsyncTask<String, Void, ListFolderResult> {

        private Exception mException;

        @Override
        protected ListFolderResult doInBackground(String... params) {
            try {
                return dbxClient.files().listFolder(TextUtils.join("/", arrPath));
            } catch (DbxException e) {
                mException = e;
                return null;
            }
        }

        @Override
        protected void onPreExecute() {
            swipeRefreshLayout.setRefreshing(true);
        }

        @Override
        protected void onPostExecute(ListFolderResult result) {
            swipeRefreshLayout.setRefreshing(false);
            if (mException == null) {
                adapter.clear();
                if (arrPath.size() > 1) {
                    FolderMetadata back = new FolderMetadata("..", "back");
                    adapter.add(back);
                }
                for (Metadata metadata : result.getEntries()) {
                    if (onlyImage && metadata instanceof FileMetadata) {
                        String[] arr = metadata.getName().toLowerCase().split(Pattern.quote("."));
                        String ext = arr[arr.length-1];
                        if (!ext.equals("jpg") && !ext.equals("png")) {
                            continue;
                        }
                    }
                    adapter.add(metadata);
                }
            } else {

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

    class DownloadTask extends AsyncTask<Void, Void, String> {

        private Exception mException;

        @Override
        protected String doInBackground(Void... params) {
            try {
                File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                if (!dir.exists()) {
                    dir.mkdirs();
                }
                File file = new File(dir, selectedFile.getName().replace(" ", ""));

                // Download the file.
                try (OutputStream outputStream = new FileOutputStream(file)) {
                    dbxClient.files().download(selectedFile.getPathLower(), selectedFile.getRev())
                            .download(outputStream);
                }

                return file.getAbsolutePath();
            } catch (DbxException | IOException e) {
                mException = e;
                return null;
            }

        }

        @Override
        protected void onPreExecute() {
            Loading.show(DropboxActivity.this, "Downloading...");
        }

        @Override
        protected void onPostExecute(String path) {
            Loading.hide();
            if (path != null) {
                Intent intent = new Intent();
                intent.putExtra("path", path);
                setResult(RESULT_OK, intent);
                finish();
            }
        }
    }


    private class FilesAdapter extends ArrayAdapter<Metadata> {

        public FilesAdapter(Context context, List<Metadata> files) {
            super(context, 0, files);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if(convertView == null){
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_file_list, parent, false);
            }

            Metadata metadata = getItem(position);

            int icon = R.drawable.d_file;
            if (metadata instanceof FolderMetadata) {
                icon = R.drawable.d_folder;
            } else {
                String[] arr = metadata.getName().toLowerCase().split(Pattern.quote("."));
                String ext = arr[arr.length-1];
                if (ext.equals("jpg") || ext.equals("png")) {
                    icon = R.drawable.d_image;
                } else if (ext.equals("pdf")) {
                    icon = R.drawable.d_pdf;
                }
            }
            ImageView iconView = (ImageView)convertView.findViewById(R.id.image_view);
            iconView.setBackgroundColor(Color.TRANSPARENT);
            iconView.setImageResource(icon);

            TextView nameView = (TextView) convertView.findViewById(R. id.file_name);
            nameView.setText(metadata.getName());

            String strSize = "";
            if (metadata instanceof FileMetadata) {
                long size = ((FileMetadata)metadata).getSize();

                if (size < 1024) {
                    strSize = size + " Bytes";
                } else if (size < 1024*1024) {
                    strSize = (int)size/1024 + " KB";
                } else if (size < 1024*1024*1024) {
                    strSize = (int)size/1024/1024 + " MB";
                } else {
                    strSize = (int)size/1024/1024/1024 + " GB";
                }
            }
            TextView attributesView = (TextView) convertView.findViewById(R.id.file_attributes);
            attributesView.setText(strSize);

            return convertView;
        }
    }



}
