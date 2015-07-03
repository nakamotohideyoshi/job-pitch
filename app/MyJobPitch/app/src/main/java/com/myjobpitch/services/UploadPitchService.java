package com.myjobpitch.services;

import android.app.IntentService;
import android.content.Context;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.auth.AuthToken;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.client.HttpStatusCodeException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

public class UploadPitchService extends IntentService {

    interface ProgressListener {
        void transferred(long transferred, long totalSize);
    }

    class CountingInputStream extends FileInputStream {

        private final ProgressListener listener;
        private final long totalSize;
        private long transferred;

        public CountingInputStream(File file, ProgressListener listener) throws FileNotFoundException {
            super(file);
            this.totalSize = file.length();
            this.listener = listener;
            this.transferred = 0;
        }

        @Override
        public int read(byte[] buffer) throws IOException {
            int bytesRead = super.read(buffer);
            this.transferred += bytesRead;
            this.listener.transferred(this.transferred, this.totalSize);
            return bytesRead;
        }

    }

    class ListenerFileSystemResource extends FileSystemResource {

        private final ProgressListener listener;

        public ListenerFileSystemResource(String file, ProgressListener listener) {
            super(file);
            this.listener = listener;
        }

        @Override
        public InputStream getInputStream() throws IOException {
            return new CountingInputStream(super.getFile(), listener);
        }

    }

    private static final String ACTION_UPLOAD = "com.myjobpitch.services.action.UPLOAD";

    private static final String EXTRA_TOKEN = "com.myjobpitch.services.extra.TOKEN";
    private static final String EXTRA_FILE = "com.myjobpitch.services.extra.FILE";

    public static final String ACTION_UPLOAD_STATUS = "com.myjobpitch.services.action.UPLOAD_STATUS";
    public static final String EXTRA_COMPLETE = "com.myjobpitch.services.extra.COMPLETE";

    public static final String ACTION_UPLOAD_COMPLETE = "com.myjobpitch.services.action.UPLOAD_COMPLETE";
    public static final String ACTION_UPLOAD_ERROR = "com.myjobpitch.services.action.UPLOAD_ERROR";

    private static boolean running = false;
    private static int complete = 0;

    public static synchronized void checkUploadState(UploadStateChecker checker) {
        checker.state(running, complete);
    }

    private static synchronized void setRunning(boolean running) {
        UploadPitchService.running = running;
    }

    public static synchronized boolean startUpload(Context context, AuthToken token, String file) {
        if (running)
            return false;
        running = true;
        Intent intent = new Intent(context, UploadPitchService.class);
        intent.setAction(ACTION_UPLOAD);
        intent.putExtra(EXTRA_TOKEN, token.getKey());
        intent.putExtra(EXTRA_FILE, file);
        context.startService(intent);
        return true;
    }

    public interface UploadStateChecker {
        void state(boolean running, int complete);
    }

    public UploadPitchService() {
        super("UploadPitchService");
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        if (intent != null) {
            final String action = intent.getAction();
            if (ACTION_UPLOAD.equals(action)) {
                final String token = intent.getStringExtra(EXTRA_TOKEN);
                final String file = intent.getStringExtra(EXTRA_FILE);
                handleActionUpload(token, file);
            }
        }
    }

    private void handleActionUpload(String token, String file) {
        MJPApi api = new MJPApi();
        api.setToken(new AuthToken(token));
        try {
            Log.d("UploadPitchService", file);
            // Upload image
            complete = 0;
            Resource upload = new ListenerFileSystemResource(file, new ProgressListener() {

                @Override
                public void transferred(long transferred, long totalSize) {
                    int newValue = Math.round((((float)transferred)/totalSize)*100);
                    if (newValue != complete) {
                        complete = newValue;
                        Intent statusIntent = new Intent(ACTION_UPLOAD_STATUS);
                        statusIntent.putExtra(EXTRA_COMPLETE, complete);
                        // Broadcasts the Intent to receivers in this app.
                        LocalBroadcastManager.getInstance(UploadPitchService.this).sendBroadcast(statusIntent);
                    }
                }
            });
            try {
                api.uploadPitch(upload);
                LocalBroadcastManager.getInstance(UploadPitchService.this).sendBroadcast(new Intent(ACTION_UPLOAD_COMPLETE));
            } catch (MJPApiException e) {
                e.printStackTrace();
                LocalBroadcastManager.getInstance(UploadPitchService.this).sendBroadcast(new Intent(ACTION_UPLOAD_ERROR));
            } catch (HttpStatusCodeException e) {
                Log.e("UploadPitchService", e.getResponseBodyAsString(), e);
                LocalBroadcastManager.getInstance(UploadPitchService.this).sendBroadcast(new Intent(ACTION_UPLOAD_ERROR));
            }
        } catch (Exception e) {
            e.printStackTrace();
            LocalBroadcastManager.getInstance(UploadPitchService.this).sendBroadcast(new Intent(ACTION_UPLOAD_ERROR));
        }
        setRunning(false);
    }

}
