package com.myjobpitch.tasks;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;

import java.io.InputStream;

public class DownloadImageTask extends AsyncTask<String, Void, Bitmap> {
    private final ProgressBar progress;
    private final ImageView imageView;

    public DownloadImageTask(ImageView imageView, ProgressBar progress) {
        this.imageView = imageView;
        this.progress = progress;
    }

    protected Bitmap doInBackground(String... urls) {
        String url = urls[0];
        Bitmap mIcon11 = null;
        Log.d("DownloadImageTask", "Starting download: " + url);
        try {
            InputStream in = new java.net.URL(url).openStream();
            mIcon11 = BitmapFactory.decodeStream(in);
        } catch (Exception e) {
            Log.e("DownloadImageTask", e.getMessage());
            e.printStackTrace();
        }
        return mIcon11;
    }

    protected void onPostExecute(Bitmap result) {
        imageView.setImageBitmap(result);
        progress.setVisibility(View.INVISIBLE);
        Log.d("DownloadImageTask", "Finished");
    }    
}