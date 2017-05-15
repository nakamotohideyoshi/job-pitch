package com.myjobpitch.utils;

import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.nostra13.universalimageloader.core.DisplayImageOptions;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.assist.FailReason;
import com.nostra13.universalimageloader.core.listener.ImageLoadingListener;

import java.io.IOException;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

import static android.media.ExifInterface.ORIENTATION_ROTATE_180;
import static android.media.ExifInterface.ORIENTATION_ROTATE_270;
import static android.media.ExifInterface.ORIENTATION_ROTATE_90;

public class ImageSelector {

    @BindView(R.id.image_add_button)
    Button addButton;

    @BindView(R.id.image_remove_button)
    Button removeButton;

    ImageView imageView;

    String defaultImagePath;
    Bitmap defaultBitmap;
    Bitmap bitmap;

    Uri imageUri;

    public ImageSelector(View view, int defaultImageRes) {
        init(view);
        defaultBitmap = BitmapFactory.decodeResource(MainActivity.instance.getResources(), defaultImageRes);
    }

    public ImageSelector(View view, String defaultImagePath) {
        init(view);
        this.defaultImagePath = defaultImagePath;
    }

    void init(View view) {
        ButterKnife.bind(this, view);

        Display display = MainActivity.instance.getWindowManager().getDefaultDisplay();
        DisplayMetrics displayMetrics = new DisplayMetrics();
        display.getMetrics(displayMetrics);
        ViewGroup.LayoutParams params = view.getLayoutParams();
        params.height = (displayMetrics.widthPixels - AppHelper.dp2px(30)) * 3 / 4;
        view.setLayoutParams(params);

        imageView = AppHelper.getImageView(view);
    }

    public void loadImage(final String path) {

        String imagePath;
        if (path == null) {
            if (defaultBitmap != null) {
                bitmap = null;
                imageView.setImageBitmap(defaultBitmap);
                removeButton.setVisibility(View.GONE);
                addButton.setText("Add Logo");
                imageUri = null;
                return;
            }
            imagePath = defaultImagePath;
            if (imagePath == null) {
                return;
            }
        } else {
            imagePath = path;
        }

        final ProgressBar progressBar = AppHelper.getProgressBar(imageView);

        DisplayImageOptions displayImageOptions = new DisplayImageOptions.Builder()
                .considerExifParams(true)
                .cacheOnDisk(true)
                .build();

        ImageLoader.getInstance().displayImage(imagePath, imageView, displayImageOptions, new ImageLoadingListener() {
            @Override
            public void onLoadingStarted(String imageUri, View view) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.VISIBLE);
                }
            }
            @Override
            public void onLoadingFailed(String uri, View view, FailReason failReason) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
            }
            @Override
            public void onLoadingComplete(String uri, View view, Bitmap loadedImage) {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }

                if (path == null) {
                    bitmap = null;
                    removeButton.setVisibility(View.GONE);
                    addButton.setText("Add Logo");
                    imageUri = null;
                } else {
                    bitmap = loadedImage;
                    removeButton.setVisibility(View.VISIBLE);
                    addButton.setText("Change Logo");
                }
            }
            @Override
            public void onLoadingCancelled(String uri, View view) {
            }
        });

    }

    public Bitmap getImage() {
        return bitmap;
    }

    public void setImageUri(Uri uri) {
        try {
            String[] projection = { MediaStore.Images.Media.DATA };
            Cursor cursor = MainActivity.instance.getContentResolver().query(uri, projection, null, null, null);
            if(cursor != null) {
                int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
                cursor.moveToFirst();
                String path = cursor.getString(column_index);
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
                bitmap = BitmapFactory.decodeFile(path);
                bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
                imageView.setImageBitmap(bitmap);
                removeButton.setVisibility(View.VISIBLE);
                addButton.setText("Change Logo");
                imageUri = uri;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Uri getImageUri() {
        return imageUri;
    }

    @OnClick(R.id.image_add_button)
    void onClickAdd() {
        MainActivity.instance.showImagePicker();
    }

    @OnClick(R.id.image_remove_button)
    void onClickRemove() {
        loadImage(null);
    }

}
