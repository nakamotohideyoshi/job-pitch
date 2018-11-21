package com.myjobpitch.utils;

import android.app.Activity;
import android.content.Context;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.media.ExifInterface;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import com.myjobpitch.pages.MainActivity;
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

    Context context;

    public ImageSelector(Context context, View view, int defaultImageRes) {
        init(context, view);
        defaultBitmap = BitmapFactory.decodeResource(context.getResources(), defaultImageRes);
    }

    public ImageSelector(Context context, View view, String defaultImagePath) {
        init(context, view);
        this.defaultImagePath = defaultImagePath;
    }

    void init(Context context, View view) {
        this.context = context;
        ButterKnife.bind(this, view);

        Display display = ((Activity)context).getWindowManager().getDefaultDisplay();
        DisplayMetrics displayMetrics = new DisplayMetrics();
        display.getMetrics(displayMetrics);
        ViewGroup.LayoutParams params = view.getLayoutParams();
        params.height = (displayMetrics.widthPixels - (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, 30,
                context.getResources().getDisplayMetrics())) * 3 / 4;
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

        AppHelper.loadImage(imagePath, imageView);
    }

    public Bitmap getImage() {
        return bitmap;
    }

    private boolean setImage(String path) {
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
            bitmap = BitmapFactory.decodeFile(path);
            bitmap = Bitmap.createBitmap(bitmap, 0, 0, bitmap.getWidth(), bitmap.getHeight(), matrix, true);
            imageView.setImageBitmap(bitmap);
            removeButton.setVisibility(View.VISIBLE);
            addButton.setText("Change Logo");
            return true;
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        }
    }

    public void setImageUri(Uri uri) {
        String path;
        String[] projection = { MediaStore.Images.Media.DATA };
        Cursor cursor = context.getContentResolver().query(uri, projection, null, null, null);
        if(cursor != null) {
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Video.Media.DATA);
            cursor.moveToFirst();
            path = cursor.getString(column_index);
        } else {
            path = uri.getPath();
        }
        if (setImage(path)) {
            imageUri = uri;
        }
    }

    public Uri getImageUri() {
        return imageUri;
    }

    @OnClick(R.id.image_remove_button)
    void onClickRemove() {
        loadImage(null);
    }

}
