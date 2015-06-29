package com.myjobpitch.tasks;

import android.content.Context;
import android.util.Log;
import android.webkit.MimeTypeMap;

import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.client.HttpStatusCodeException;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jcockburn on 26/05/2015.
 */
public class UploadPitch extends APITask<Boolean> {
    public interface ProgressListener {
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

    private ProgressListener progressListener;
    private final MJPApi api;
    private final Context context;
    private final String pitch;

    public UploadPitch(Context context, MJPApi api, String pitch, ProgressListener progressListener) {
        this.context = context;
        this.api = api;
        this.pitch = pitch;
        this.progressListener = progressListener;
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        MimeTypeMap mime = MimeTypeMap.getSingleton();
        try {
            Log.d("Uploading pitch", pitch);
            // Upload image
            Resource upload = new ListenerFileSystemResource(pitch, progressListener);
            try {
                api.uploadPitch(upload);
            } catch (MJPApiException e) {
                e.printStackTrace();
                return Boolean.FALSE;
            } catch (HttpStatusCodeException e) {
                Log.e("Upload Pitch", e.getResponseBodyAsString(), e);
                return Boolean.FALSE;
            }
            return Boolean.TRUE;
        } catch (Exception e) {
            e.printStackTrace();
            return Boolean.FALSE;
        }
    }
}
