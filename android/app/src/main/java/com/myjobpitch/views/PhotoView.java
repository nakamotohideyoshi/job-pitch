package com.myjobpitch.views;

import android.app.Dialog;
import android.content.Context;
import android.graphics.Point;
import android.graphics.drawable.ColorDrawable;
import android.net.Uri;
import android.view.Display;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;

import com.myjobpitch.R;

import me.relex.photodraweeview.PhotoDraweeView;

public class PhotoView extends Dialog {

    public PhotoView(Context context, String path) {

        super(context);

        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setBackgroundDrawable(new ColorDrawable(android.graphics.Color.TRANSPARENT));
        setContentView(R.layout.view_photoview);
        setCancelable(true);

        PhotoDraweeView photoDraweeView = findViewById(R.id.photo_drawee_view);
        ViewGroup.LayoutParams params = photoDraweeView.getLayoutParams();

        WindowManager wm = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
        Display display = wm.getDefaultDisplay();
        Point size = new Point();
        display.getSize(size);

        params.width = size.x;
        params.height = size.y;
        photoDraweeView.setLayoutParams(params);

        photoDraweeView.setPhotoUri(Uri.parse(path));

    }

}
