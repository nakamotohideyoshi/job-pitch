package com.myjobpitch.tasks;

import android.content.Context;
import android.net.Uri;
import android.util.Log;
import android.webkit.MimeTypeMap;

import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ImageUpload;

import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * Created by jcockburn on 26/05/2015.
 */
public class UploadImageTask extends APITask0<Boolean> {
    private final Context context;
    private final String endpoint;
    private final String objectKey;
    private final Uri imageUri;
    private final MJPAPIObject object;

    public UploadImageTask(Context context, String endpoint, String objectKey, Uri imageUri, MJPAPIObject object) {
        this.context = context;
        this.endpoint = endpoint;
        this.objectKey = objectKey;
        this.imageUri = imageUri;
        this.object = object;
    }

    @Override
    protected Boolean doInBackground(Void... params) {
        MimeTypeMap mime = MimeTypeMap.getSingleton();
        String extension = mime.getExtensionFromMimeType(context.getContentResolver().getType(imageUri));
        try {
            File outputFile = File.createTempFile("upload_" + imageUri.getLastPathSegment(), "." + extension, context.getCacheDir());
            Log.d("Uploading Image", outputFile.getName());
            try {
                // Copy imageUri content to temp file
                InputStream in = context.getContentResolver().openInputStream(imageUri);
                try {
                    FileOutputStream out = new FileOutputStream(outputFile);
                    try {
                        byte[] buf = new byte[1024];
                        int len;
                        while ((len = in.read(buf)) > 0)
                            out.write(buf, 0, len);
                    } finally {
                        out.close();
                    }
                } finally {
                    in.close();
                }

                // Upload image
                ImageUpload image = new ImageUpload();
                image.setObject(object.getId());
                image.setOrder(0);
                image.setImage(new FileSystemResource(outputFile));
                try {
                    MJPApi.shared().uploadImage(endpoint, objectKey, image);
                } catch (MJPApiException e) {
                    e.printStackTrace();
                    return Boolean.FALSE;
                }
                return Boolean.TRUE;
            } finally {
                outputFile.delete();
            }
        } catch (IOException e) {
            e.printStackTrace();
            return Boolean.FALSE;
        }
    }
}
