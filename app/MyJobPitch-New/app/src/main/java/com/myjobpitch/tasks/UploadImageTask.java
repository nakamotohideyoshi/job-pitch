package com.myjobpitch.tasks;

import android.content.Context;
import android.net.Uri;
import android.os.Environment;

import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ImageUpload;

import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class UploadImageTask extends APITask {

    public UploadImageTask(final Context context, final String endpoint, final String objectKey, final Uri imageUri, final MJPAPIObject object) {

        super(new APIAction() {

            @Override
            public void run() throws MJPApiException {
                try {
                    File dir = new File(Environment.getExternalStorageDirectory(), "MyJobPitch");
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    String filename = "photo_" + imageUri.getLastPathSegment();
                    File outputFile = new File(dir, filename);
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
                        }
                    } finally {
                        outputFile.delete();
                    }
                } catch (IOException e) {
                }
            }

        });

    }

}
