package com.myjobpitch.utils;

import android.graphics.Bitmap;
import android.graphics.Paint;
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
import com.myjobpitch.api.MJPObjectWithName;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewStatus;
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
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

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

    public static <T extends MJPObjectWithName> List<String> getNames(List<T> objects) {
        List<String> names = new ArrayList<>();
        for (T item : objects) {
            names.add(item.getName());
        }
        return names;
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

    public static void setEmptyViewText(View emptyView, int textId) {
        ((TextView)emptyView.findViewById(R.id.empty_text)).setText(textId);
    }

    public static void setJobTitleViewText(View jobTitleView, String title) {
        ((TextView)jobTitleView.findViewById(R.id.job_title_text)).setText(title);
    }

    public static void setEmptyButtonText(View emptyView, String text) {
        ((TextView)emptyView.findViewById(R.id.empty_button)).setText(text);
    }

    public static void setEmptyButtonText(View emptyView, int textId) {
        ((TextView)emptyView.findViewById(R.id.empty_button)).setText(textId);
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

    public static TextView getItemStatusTitleView(View view) {
        return (TextView) view.findViewById(R.id.item_status);
    }
    public static TextView getItemDateTimeTitleView(View view) {
        return (TextView) view.findViewById(R.id.item_date_time);
    }

    public static TextView getItemLocationTitleView(View view) {
        return (TextView) view.findViewById(R.id.item_location);
    }

    public static void showInterviewInfo(Interview interview, View view, Application application) {

        JobSeeker jobSeeker = application.getJob_seeker();
        Job job = application.getJob_data();
        String status = interview.getStatus();

        if (AppData.user.isRecruiter()) {
            loadJobSeekerImage(jobSeeker, getImageView(view));

            // job seeker name
            getItemTitleView(view).setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());

            // CV

            getItemSubTitleView(view).setText(jobSeeker.getDescription());
        } else {
            loadJobLogo(job, getImageView(view));

            getItemTitleView(view).setText(job.getTitle());

            getItemSubTitleView(view).setText(job.getDescription());
        }

        // Date/Time
        SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
        SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
        getItemDateTimeTitleView(view).setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));

        // Location

        getItemLocationTitleView(view).setText(application.getJob_data().getLocation_data().getName());

        switch (status) {

            case InterviewStatus.PENDING:
                // Status
                getItemStatusTitleView(view).setText(AppData.user.isRecruiter() ? R.string.interview_sent : R.string.interview_received);
                break;
            case InterviewStatus.ACCEPTED:
                // Status
                getItemStatusTitleView(view).setText(R.string.interview_accepted);
                break;

            case InterviewStatus.COMPLETED:
                // Status
                getItemStatusTitleView(view).setText(R.string.interview_done);
                break;

            case InterviewStatus.CANCELLED:
                // Status
                //getItemStatusTitleView(view).setText("Interview cancelled");
                if (interview.getCancelled_by() == AppData.JOBSEEKER) {
                    getItemStatusTitleView(view).setText(R.string.interview_cancel_by_js);
                } else if (interview.getCancelled_by() == AppData.RECRUITER) {
                    getItemStatusTitleView(view).setText(R.string.interview_cancel_by_rc);
                }

                view.setAlpha(0.8f);
                view.setBackgroundColor(0xFFE1E1E1);
                getItemTitleView(view).setPaintFlags(getItemTitleView(view).getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                getItemSubTitleView(view).setPaintFlags(getItemSubTitleView(view).getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                getItemStatusTitleView(view).setPaintFlags(getItemStatusTitleView(view).getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                getItemDateTimeTitleView(view).setPaintFlags(getItemDateTimeTitleView(view).getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                getItemLocationTitleView(view).setPaintFlags(getItemLocationTitleView(view).getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);

                break;
            default:
                break;

        }

    }


    public static void showApplicationInterviewInfo(Interview interview, View view) {
        // Date/Time
        SimpleDateFormat format = new SimpleDateFormat("E d MMM, yyyy");
        SimpleDateFormat format1 = new SimpleDateFormat("HH:mm");
        getItemDateTimeTitleView(view).setText(format.format(interview.getAt()) + " at " + format1.format(interview.getAt()));

        // Status
        String status = interview.getStatus();

        switch (status) {

            case InterviewStatus.PENDING:
                // Status
                getItemStatusTitleView(view).setText(AppData.user.isRecruiter() ? R.string.interview_sent : R.string.interview_received);
                break;
            case InterviewStatus.ACCEPTED:
                // Status
                getItemStatusTitleView(view).setText(R.string.interview_accepted);
                break;

            case InterviewStatus.COMPLETED:
                // Status
                getItemStatusTitleView(view).setText(R.string.interview_done);
                break;

            case InterviewStatus.CANCELLED:
                // Status
                //getItemStatusTitleView(view).setText("Interview cancelled");
                if (interview.getCancelled_by() == AppData.JOBSEEKER) {
                    getItemStatusTitleView(view).setText(R.string.interview_cancel_by_js);
                } else if (interview.getCancelled_by() == AppData.RECRUITER) {
                    getItemStatusTitleView(view).setText(R.string.interview_cancel_by_rc);
                }
                break;
            default:
                break;
        }
    }

    public static void showJobInfo(Job job, View view) {

        // logo
        loadJobLogo(job, view);

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

    public static void loadJobSeekerImage(JobSeeker jobSeeker, View container) {
        loadJobSeekerImage(jobSeeker, getImageView(container));
    }

    public static void loadJobSeekerImage(JobSeeker jobSeeker, ImageView imageView) {
        if (jobSeeker.getProfile_thumb() != null) {
            loadImage(jobSeeker.getProfile_thumb(), imageView);
            return;
        }

        Pitch pitch = jobSeeker.getPitch();
        if (pitch != null) {
            loadImage(pitch.getThumbnail(), imageView);
            return;
        }

        imageView.setImageResource(R.drawable.avatar);
    }

    public static void loadJobLogo(Job job, View container) {
        loadJobLogo(job, getImageView(container));
    }

    public static void loadJobLogo(Job job, ImageView imageView) {
        Image logo = getJobLogo(job);
        if (logo != null) {
            loadImage(logo.getThumbnail(), imageView);
        } else {
            imageView.setImageResource(R.drawable.default_logo);
        }
    }

    public static Image getBusinessLogo(Business business) {
        List<Image> images = business.getImages();
        if (images != null && images.size() > 0) {
            return images.get(0);
        }
        return null;
    }

    public static Image getWorkplaceLogo(com.myjobpitch.api.data.Location workplace) {
        List<Image> images = workplace.getImages();
        if (images != null && images.size() > 0) {
            return images.get(0);
        }
        return getBusinessLogo(workplace.getBusiness_data());
    }

    public static Image getJobLogo(Job job) {
        List<Image> images = job.getImages();
        if (images != null && images.size() > 0) {
            return images.get(0);
        }
        return getWorkplaceLogo(job.getLocation_data());
    }

}
