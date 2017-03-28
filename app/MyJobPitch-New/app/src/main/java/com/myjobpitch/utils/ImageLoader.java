package com.myjobpitch.utils;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.AsyncTask;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Pitch;

import java.io.InputStream;
import java.util.HashMap;

public class ImageLoader extends AsyncTask<Void, Void, Bitmap> {

    static HashMap<String, Bitmap> cache = new HashMap<>();

    String path;
    View container;
    Listener listener;

    public ImageLoader(final String path, final View imageContainer, Listener listener) {
        this.path = path;
        this.container = imageContainer;
        this.listener = listener;
        if (container != null) {
            container.setTag(path);
            getImageView(container).setImageBitmap(null);
            getLoaidngView(container).setVisibility(View.VISIBLE);
        }
        execute();
    }

    @Override
    protected Bitmap doInBackground(Void... params) {

        if (cache.containsKey(path)) {
            return cache.get(path);
        }

        Uri uri = Uri.parse(path);

        try {
            InputStream in;
            if (uri.getScheme().equals("http") || uri.getScheme().equals("https")) {
                in = new java.net.URL(uri.toString()).openStream();
            } else {
                in = MainActivity.instance.getContentResolver().openInputStream(uri);
            }
            try {
                return BitmapFactory.decodeStream(in);
            } finally {
                in.close();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    @Override
    protected void onPostExecute(final Bitmap bitmap) {
        if (bitmap != null && !cache.containsKey(path)) {
            cache.put(path, bitmap);
        }

        if (container != null) {
            if (container.getTag().equals(path)) {
                getImageView(container).setImageBitmap(bitmap);
                getLoaidngView(container).setVisibility(View.GONE);
            } else {
                return;
            }
        }

        if (listener != null) {
            listener.success(bitmap);
        }
    }

    public interface Listener {
        void success(Bitmap bitmap);
    }

    public static void setImage(View imageContainer, int resID) {
        imageContainer.setTag("");
        getImageView(imageContainer).setImageResource(R.drawable.default_logo);
        getLoaidngView(imageContainer).setVisibility(View.GONE);
    }

    public static ImageView getImageView(View imageContainer) {
        return (ImageView) imageContainer.findViewById(R.id.image_view);
    }

    public static ProgressBar getLoaidngView(View imageContainer) {
        return (ProgressBar) imageContainer.findViewById(R.id.progress_bar);
    }

    public static void loadJobLogo(Job job, View view) {
        if (job.getImages().size() > 0) {
            new ImageLoader(job.getImages().get(0).getThumbnail(), view, null);
        } else {
            Location location = job.getLocation_data();
            if (location.getImages().size() > 0) {
                new ImageLoader(location.getImages().get(0).getThumbnail(), view, null);
            } else {
                Business business = location.getBusiness_data();
                if (business.getImages().size() > 0) {
                    new ImageLoader(business.getImages().get(0).getThumbnail(), view, null);
                } else {
                    ImageLoader.setImage(view, R.drawable.default_logo);
                }
            }
        }
    }

    public static void loadJobSeekerImage(JobSeeker jobSeeker, View view) {
        Pitch pitch = jobSeeker.getPitch();
        if (pitch != null) {
            new ImageLoader(pitch.getThumbnail(), view, null);
        } else {
            ImageLoader.setImage(view, R.drawable.icon_no_img);
        }
    }

}
