package com.myjobpitch.utils;

import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.provider.MediaStore;
import android.widget.ImageView;

import java.io.File;
import java.io.IOException;

import static android.media.ExifInterface.ORIENTATION_ROTATE_180;
import static android.media.ExifInterface.ORIENTATION_ROTATE_270;
import static android.media.ExifInterface.ORIENTATION_ROTATE_90;

public class ImageSelectorNew {

    private Context context;
    private ImageView imageView;

    private boolean isDefaultImage = true;

    private String defaultImagePath;
    private Bitmap defaultBitmap;

    private Uri imageUri;

    public ImageSelectorNew(Context context, ImageView imageView, int defaultImageRes) {
        this.context = context;
        this.imageView = imageView;
        defaultBitmap = BitmapFactory.decodeResource(context.getResources(), defaultImageRes);
    }

    public ImageSelectorNew(Context context, ImageView imageView, String defaultImagePath) {
        this.context = context;
        this.imageView = imageView;
        this.defaultImagePath = defaultImagePath;
    }

    public void loadImage(String path) {

        if (path != null) {
            isDefaultImage = false;
            AppHelper.loadImage(path, imageView);
            return;
        }

        imageUri = null;
        isDefaultImage = true;

        if (defaultImagePath != null) {
            AppHelper.loadImage(defaultImagePath, imageView);
            return;
        }

        if (defaultBitmap != null) {
            imageView.setImageBitmap(defaultBitmap);
        }
    }

    public boolean isDefaultImage() {
        return isDefaultImage;
    }

    public void setImage(Bitmap bitmap) {
        File file = AppHelper.saveBitmap(bitmap);
        imageUri = Uri.fromFile(file);
        imageView.setImageBitmap(bitmap);
    }

    public void setImage(Uri uri) {
        String path;
        String[] projection = { MediaStore.Images.Media.DATA };
        Cursor cursor = context.getContentResolver().query(uri, projection, null, null, null);

        if (cursor != null) {
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
            cursor.moveToFirst();
            path = cursor.getString(column_index);
        } else {
            path = uri.getPath();
        }

        try {
            ExifInterface exif = new ExifInterface(path);
            int orientation = exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, 1);
            Matrix matrix = new Matrix();
            switch (orientation) {
                case ORIENTATION_ROTATE_90:
                    matrix.postRotate(90);
                    break;
                case ORIENTATION_ROTATE_180:
                    matrix.postRotate(180);
                    break;
                case ORIENTATION_ROTATE_270:
                    matrix.postRotate(270);
                    break;
            }
            Bitmap bitmap = BitmapFactory.decodeFile(path);
            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            imageView.setImageBitmap(bitmap);

            imageUri = uri;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Uri getImageUri() {
        return imageUri;
    }
}
