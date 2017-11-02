package com.myjobpitch.utils;

import android.graphics.Bitmap;
import android.location.Location;
import android.os.Environment;
import android.util.TypedValue;
import android.view.View;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.MainActivity;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Pitch;
import com.nostra13.universalimageloader.core.DisplayImageOptions;
import com.nostra13.universalimageloader.core.ImageLoader;
import com.nostra13.universalimageloader.core.assist.FailReason;
import com.nostra13.universalimageloader.core.listener.ImageLoadingListener;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

public class AppHelper {

    public static int dp2px(int dp) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dp,
                MainActivity.shared().getResources().getDisplayMetrics());
    }

    public static String getJobSeekerName(JobSeeker jobSeeker) {
        return jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
    }

    public static String getBusinessName(Job job) {
        return job.getLocation_data().getBusiness_data().getName() + ", " + job.getLocation_data().getName();
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

    // view_empty_view.xml

    public static void setEmptyViewText(View emptyView, String title) {
        ((TextView)emptyView.findViewById(R.id.empty_text)).setText(title);
    }

    public static void setEmptyButtonText(View emptyView, String text) {
        ((TextView)emptyView.findViewById(R.id.empty_button)).setText(text);
    }

    // ..._edit_buttons.xml

    public static ImageButton getEditButton(View view) {
        return (ImageButton)view.findViewById(R.id.edit_button);
    }

    public static ImageButton getRemoveButton(View view) {
        return (ImageButton)view.findViewById(R.id.remove_button);
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

    public static void showBusinessInfo(Business business, View view) {

        // logo
        if (business.getImages().size() > 0) {
            loadImage(business.getImages().get(0).getThumbnail(), view);
        } else {
            getImageView(view).setImageResource(R.drawable.default_logo);
        }

        // business name
        getItemTitleView(view).setText(business.getName());

        // location count
        int locationCount = business.getLocations().size();
        getItemSubTitleView(view).setText("Includes " + locationCount + (locationCount > 1 ? " work places" : " work place"));

        // credit count
        int creditCount = business.getTokens();
        getItemAttributesView(view).setText(creditCount + (creditCount > 1 ? " credits" : " credit"));

    }

    public static void showLocationInfo(com.myjobpitch.api.data.Location location, View view) {

        // logo
        if (location.getImages().size() > 0) {
            loadImage(location.getImages().get(0).getThumbnail(), view);
        } else {
            Business business = location.getBusiness_data();
            if (business.getImages().size() > 0) {
                loadImage(business.getImages().get(0).getThumbnail(), view);
            } else {
                getImageView(view).setImageResource(R.drawable.default_logo);
            }
        }

        // location name
        getItemTitleView(view).setText(location.getName());

        // job count
        int jobCount = location.getJobs().size();
        getItemSubTitleView(view).setText("Includes " + jobCount + (jobCount > 1 ? " jobs" : " job"));

        getItemAttributesView(view).setVisibility(View.GONE);

    }

    public static void showJobInfo(Job job, View view) {

        // logo
        AppHelper.loadJobLogo(job, view);

        // job title
        getItemTitleView(view).setText(job.getTitle());

        // business and location name
        getItemSubTitleView(view).setText(getBusinessName(job));

        getItemAttributesView(view).setVisibility(View.GONE);

    }

    // image loader

    public static void loadImage(String url, View container) {
        loadImage(url, getImageView(container));
    }

    public static void loadImage(String url, ImageView imageView) {
        if (imageView == null) return;

        final ProgressBar progressBar = getProgressBar(imageView);

        DisplayImageOptions displayImageOptions = new DisplayImageOptions.Builder()
                .considerExifParams(true)
                .cacheOnDisk(true)
                .build();

        ImageLoader.getInstance().displayImage(url, imageView, displayImageOptions, new ImageLoadingListener() {
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
            }
            @Override
            public void onLoadingCancelled(String uri, View view) {
            }
        });

    }

    public static void loadJobLogo(Job job, View container) {
        loadJobLogo(job, getImageView(container));
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

    public static void loadJobSeekerImage(JobSeeker jobSeeker, View container) {
        loadJobSeekerImage(jobSeeker, getImageView(container));
    }

    public static void loadJobSeekerImage(JobSeeker jobSeeker, ImageView imageView) {
        Pitch pitch = jobSeeker.getPitch();
        if (pitch != null) {
            loadImage(pitch.getThumbnail(), imageView);
        } else {
            imageView.setImageResource(R.drawable.icon_no_img);
        }
    }

    public static File saveBitmap(Bitmap bmp) {
        File dir = new File (Environment.getExternalStorageDirectory(), "MyJobPitch");
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File file = new File(dir, timeStamp + ".jpg");
        try {
            OutputStream outStream = new FileOutputStream(file);
            bmp.compress(Bitmap.CompressFormat.JPEG, 100, outStream);
            outStream.flush();
            outStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return file;
    }
}
