package com.myjobpitch.utils;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
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
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

import java.io.IOException;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ImageSelector {

    public static final int IMAGE_PICK = 11000;

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
        if (progressBar != null) {
            progressBar.setVisibility(View.VISIBLE);
        }

        Picasso.with(MainActivity.instance).load(imagePath).into(imageView, new Callback() {
            @Override
            public void onSuccess() {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }

                if (path == null) {
                    bitmap = null;
                    removeButton.setVisibility(View.GONE);
                    addButton.setText("Add Logo");
                    imageUri = null;
                } else {
                    BitmapDrawable drawable = (BitmapDrawable) imageView.getDrawable();
                    bitmap = drawable.getBitmap();
                    removeButton.setVisibility(View.VISIBLE);
                    addButton.setText("Change Logo");
                }

            }

            @Override
            public void onError() {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });
    }

    public Bitmap getImage() {
        return bitmap;
    }

    public void setImageUri(Uri uri) {
        try {
            bitmap = MediaStore.Images.Media.getBitmap(MainActivity.instance.getContentResolver(), uri);
            imageView.setImageBitmap(bitmap);
            removeButton.setVisibility(View.VISIBLE);
            addButton.setText("Change Logo");
            imageUri = uri;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Uri getImageUri() {
        return imageUri;
    }

    @OnClick(R.id.image_add_button)
    void onClickAdd() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType("image/*");
        MainActivity.instance.startActivityForResult(intent, IMAGE_PICK);
    }

    @OnClick(R.id.image_remove_button)
    void onClickRemove() {
        loadImage(null);
    }

}
