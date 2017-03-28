package com.myjobpitch.utils;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;

import java.io.IOException;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ImageSelector {

    public static final int IMAGE_PICK = 11000;

    @BindView(R.id.image_add)
    View addButton;

    @BindView(R.id.image_remove)
    Button removeButton;

    ImageView imageView;

    Bitmap defaultBitmap;
    Bitmap bitmap;

    Uri imageUri;

    public ImageSelector(View view, int defaultImageRes) {
        ButterKnife.bind(this, view);

        Display display = MainActivity.instance.getWindowManager().getDefaultDisplay();
        DisplayMetrics displayMetrics = new DisplayMetrics();
        display.getMetrics(displayMetrics);
        ViewGroup.LayoutParams params = view.getLayoutParams();
        params.height = (displayMetrics.widthPixels - AppHelper.dp2px(30)) * 3 / 4;
        view.setLayoutParams(params);

        imageView = ImageLoader.getImageView(view);

        if (defaultImageRes != -1) {
            defaultBitmap = BitmapFactory.decodeResource(MainActivity.instance.getResources(), defaultImageRes);
            setImage(null);
        }
    }

    public void setDefaultImage(String path) {
        new ImageLoader(path, null, new ImageLoader.Listener() {
            @Override
            public void success(Bitmap bitmap) {
                defaultBitmap = bitmap;
                if (imageView.getAlpha() == 0.2f) {
                    setImage(null);
                }
            }
        });
    }

    public void loadImage(String path) {
        removeButton.setVisibility(View.GONE);
        addButton.setVisibility(View.GONE);
        new ImageLoader(path, (View)imageView.getParent(), new ImageLoader.Listener() {
            @Override
            public void success(Bitmap bitmap) {
                setImage(bitmap);
            }
        });
    }

    void setImage(Bitmap bitmap) {
        this.bitmap = bitmap;
        if (bitmap == null) {
            imageView.setImageBitmap(defaultBitmap);
            imageView.setAlpha(0.2f);
            addButton.setVisibility(View.VISIBLE);
            removeButton.setVisibility(View.GONE);
        } else {
            imageView.setImageBitmap(bitmap);
            imageView.setAlpha(1.0f);
            addButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.VISIBLE);
        }
    }

    public Bitmap getImage() {
        return bitmap;
    }

    public void setImageUri(Uri uri) {
        try {
            Bitmap bitmap = MediaStore.Images.Media.getBitmap(MainActivity.instance.getContentResolver(), uri);
            setImage(bitmap);
            imageUri = uri;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Uri getImageUri() {
        return imageUri;
    }

    @OnClick(R.id.image_add)
    void onClickAdd() {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType("image/*");
        MainActivity.instance.startActivityForResult(intent, IMAGE_PICK);
    }

    @OnClick(R.id.image_remove)
    void onClickRemove() {
        setImage(null);
        imageUri = null;
    }

}
