package com.myjobpitch.tasks;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;

import java.io.InputStream;

public class DownloadImageTask extends AsyncTask<Uri, Void, Bitmap> {
    private final ProgressBar progress;
    private final ImageView imageView;
    private final Context context;

    public interface DownloadImageTaskListener {
        void onComplete(Bitmap bitmap);
        void onError();
    }

    private DownloadImageTaskListener listener = null;

    public DownloadImageTask(Context context, ImageView imageView, ProgressBar progress) {
        this.context = context;
        this.imageView = imageView;
        this.progress = progress;
    }

    public void setListener(DownloadImageTaskListener listener) {
        this.listener = listener;
    }

    protected Bitmap doInBackground(Uri... urls) {
        Uri url = urls[0];
        Bitmap bitmap = null;
        Log.d("DownloadImageTask", "Starting download: " + url);
        try {
            InputStream in;
            if (url.getScheme().equals("http") || url.getScheme().equals("https"))
                in = new java.net.URL(url.toString()).openStream();
            else
                in = context.getContentResolver().openInputStream(url);

            try {
                bitmap = BitmapFactory.decodeStream(in);
            } finally {
                in.close();
            }
        } catch (Exception e) {
            Log.e("DownloadImageTask", e.getMessage());
            e.printStackTrace();
        }
        return bitmap;
    }

    protected void onPostExecute(Bitmap result) {
        imageView.setImageBitmap(result);
        progress.setVisibility(View.INVISIBLE);
        if (listener != null) {
            if (result == null)
                listener.onError();
            else
                listener.onComplete(result);
        }
    }
}
