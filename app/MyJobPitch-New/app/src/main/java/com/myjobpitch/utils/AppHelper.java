package com.myjobpitch.utils;

import android.content.Context;
import android.location.Location;
import android.os.Handler;
import android.support.v4.content.ContextCompat;
import android.util.TypedValue;
import android.view.View;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.kaopiz.kprogresshud.KProgressHUD;
import com.myjobpitch.R;
import com.myjobpitch.MainActivity;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Pitch;
import com.squareup.picasso.Callback;
import com.squareup.picasso.Picasso;

public class AppHelper {

    public static KProgressHUD loadingbar;

    public static void showLoading(final String label) {
        showLoading(MainActivity.instance, label);
    }

    public static void showLoading(final Context context, final String label) {

        if (loadingbar == null) {
            loadingbar = KProgressHUD.create(context)
                    .setStyle(KProgressHUD.Style.SPIN_INDETERMINATE)
                    .setCancellable(false)
                    .setDimAmount(0.65f)
                    .setMaxProgress(1000)
                    .setWindowColor(ContextCompat.getColor(context, R.color.colorPopup));
        }

        Handler mainHandler = new Handler(context.getMainLooper());

        Runnable myRunnable = new Runnable() {
            @Override
            public void run() {
                loadingbar.setLabel(label).show();
            }
        };

        mainHandler.post(myRunnable);

    }

    public static void hideLoading() {
        hideLoading(MainActivity.instance);
    }

    public static void hideLoading(Context context) {
        if (loadingbar == null) return;

        final KProgressHUD lb = loadingbar;
        loadingbar = null;
        Handler mainHandler = new Handler(context.getMainLooper());

        Runnable myRunnable = new Runnable() {
            @Override
            public void run() {
                lb.dismiss();
            }
        };

        mainHandler.post(myRunnable);

    }

    public static int dp2px(int dp) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp,
                MainActivity.instance.getResources().getDisplayMetrics());
    }

    // empty view

    public static void setEmptyViewText(View emptyView, String title) {
        ((TextView)emptyView.findViewById(R.id.empty_text)).setText(title);
    }

    public static void setEmptyButtonText(View emptyView, String text) {
        ((TextView)emptyView.findViewById(R.id.empty_button)).setText(text);
    }

    // distance

    public static String distance(double latitude1, double longitude1, double latitude2, double longitude2) {
        Location locationA = new Location("point A");
        locationA.setLatitude(latitude1);
        locationA.setLongitude(longitude1);
        Location locationB = new Location("point B");
        locationB.setLatitude(latitude2);
        locationB.setLongitude(longitude2);
        float d = locationA.distanceTo(locationB);
        if (d < 1000) {
            return String.format("%.0f m", d);
        }
        if (d < 10000) {
            return String.format("%.1f km", d/1000);
        }
        return String.format("%.0f km", d/1000);
    }

    // view_image_loader.xml

    public static ImageView getImageView(View view) {
        return (ImageView) view.findViewById(R.id.image_view);
    }

    public static ProgressBar getProgressBar(ImageView imageView) {
        View view = (View)imageView.getParent();
        return (ProgressBar) view.findViewById(R.id.progress_bar);
    }

    // view_job_item.xml

    public static TextView getItemTitleView(View view) {
        return (TextView) view.findViewById(R.id.item_title);
    }
    public static TextView getItemSubTitleView(View view) {
        return (TextView) view.findViewById(R.id.item_subtitle);
    }
    public static TextView getItemAttributesView(View view) {
        return (TextView) view.findViewById(R.id.item_attributes);
    }

    // image loader

    public static void loadImage(String url, ImageView imageView) {
        if (imageView == null) return;

        final ProgressBar progressBar = getProgressBar(imageView);
        if (progressBar != null) {
            progressBar.setVisibility(View.VISIBLE);
        }

        Picasso.with(MainActivity.instance).load(url).into(imageView, new Callback() {
            @Override
            public void onSuccess() {
                if (progressBar != null) {
                    progressBar.setVisibility(View.GONE);
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

    public static void loadJobLogo(Job job, ImageView imageView) {
        if (job.getImages().size() > 0) {
            loadImage(job.getImages().get(0).getThumbnail(), imageView);
        } else {
            com.myjobpitch.api.data.Location location = job.getLocation_data();
            if (location.getImages().size() > 0) {
                loadImage(location.getImages().get(0).getThumbnail(), imageView);
            } else {
                Business business = location.getBusiness_data();
                if (business.getImages().size() > 0) {
                    loadImage(business.getImages().get(0).getThumbnail(), imageView);
                } else {
                    imageView.setImageResource(R.drawable.default_logo);
                }
            }
        }
    }

    public static void loadJobSeekerImage(JobSeeker jobSeeker, ImageView imageView) {
        Pitch pitch = jobSeeker.getPitch();
        if (pitch != null) {
            loadImage(pitch.getThumbnail(), imageView);
        } else {
            imageView.setImageResource(R.drawable.icon_no_img);
        }
    }
}
