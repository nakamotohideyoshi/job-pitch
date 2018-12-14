package com.myjobpitch.fragments;

import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.view.PagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.myjobpitch.activities.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.models.JobResourceModel;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.PhotoView;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ApplicationDetailFragment extends BaseFragment {

    @BindView(R.id.viewpager)
    ViewPager viewPager;

    @BindView(R.id.job_title)
    TextView titleView;

    @BindView(R.id.job_subtitle)
    TextView subtitleView;

    @BindView(R.id.job_contract)
    TextView contractText;

    @BindView(R.id.job_hours)
    TextView hoursText;

    @BindView(R.id.apply_button)
    Button applyButton;
    @BindView(R.id.remove_button)
    Button removeButton;

    @BindView(R.id.job_distance_view)
    View distanceView;
    @BindView(R.id.job_distance)
    TextView distanceText;

    @BindView(R.id.job_desc)
    TextView descView;

    @BindView(R.id.location_desc)
    TextView locationDescView;

    @BindView(R.id.map_view)
    MapView mapView;

    GoogleMap googleMap;
    JobSeeker jobSeeker;
    JobProfile profile;

    List<JobResourceModel> resources = new ArrayList<>();

    public Application application;
    public Job job;
    public Action action;

    public boolean viewMode = false;

    public interface Action {
        void apply();
        void remove();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_application_detail, container, false);
        ButterKnife.bind(this, view);

        title = getString(R.string.job_details);

        addMenuItem(MENUGROUP2, 100, getString(R.string.share), R.drawable.ic_share);

        // map setting

        mapView.onCreate(savedInstanceState);
        mapView.onResume();

        try {
            MapsInitializer.initialize(getActivity().getApplicationContext());
        } catch (Exception e) {
            e.printStackTrace();
        }

        JobResourcePagerAdapter pagerAdapter = new JobResourcePagerAdapter();
        viewPager.setAdapter(pagerAdapter);
        viewPager.addOnPageChangeListener(pagerAdapter);

        // load data

        if (application != null) {
            job = application.getJob_data();
        }

        showLoading(view);
        new APITask(() -> {
            jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
            profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                load();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

        return view;

    }

    void load() {

        Pitch pitch = job.getPitch();
        if (pitch != null) {
            JobResourceModel resource = new JobResourceModel();
            resource.thumbnail = pitch.getThumbnail();
            resource.video = pitch.getVideo();
            resources.add(resource);
        }

        JobResourceModel logoModel = new JobResourceModel();
        logoModel.isLogo = true;
        Image logo = AppHelper.getJobLogo(job);
        if (logo != null) {
            logoModel.thumbnail = logo.getThumbnail();
            logoModel.image = logo.getImage();
        }
        resources.add(logoModel);

        Location location = job.getLocation_data();
        Contract contract = AppData.getObjById(AppData.contracts, job.getContract());
        Hours hours = AppData.getObjById(AppData.hours, job.getHours());

        titleView.setText(job.getTitle());
        distanceText.setText(AppHelper.distance(profile.getLatitude(), profile.getLongitude(), location.getLatitude(), location.getLongitude()));
        subtitleView.setText(AppHelper.getBusinessName(job));

        hoursText.setText(hours.getName());
        contractText.setText(contract.getName());

        descView.setText(job.getDescription());
        locationDescView.setText(location.getDescription());

        if (viewMode) {
            applyButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.GONE);
        } else if (application != null) {
            applyButton.setText("Message");
            removeButton.setVisibility(View.GONE);
        }

        mapView.getMapAsync(map -> {
            googleMap = map;
            googleMap.getUiSettings().setMyLocationButtonEnabled(false);
            Location location1 = job.getLocation_data();
            LatLng latLng = new LatLng(location1.getLatitude(), location1.getLongitude());
            if (application != null) {
                googleMap.addMarker(new MarkerOptions().position(latLng));
            } else {
                double alpha = 2 * Math.PI * Math.random();
                double rand = Math.random();
                latLng = new LatLng(
                        latLng.latitude + 0.00434195349206 * Math.cos(alpha) * rand,
                        latLng.longitude + 0.00528038212262 * Math.sin(alpha) * rand);
                googleMap.addCircle(new CircleOptions()
                        .center(latLng)
                        .radius(482.8)
                        .strokeWidth(2)
                        .strokeColor(Color.argb(255, 0, 182, 164))
                        .fillColor(Color.argb(51, 255, 147, 0)));
            }
            googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 14));
        });

        viewPager.getAdapter().notifyDataSetChanged();

    }

    void showProfile() {
        TalentProfileFragment fragment = new TalentProfileFragment();
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.apply_button)
    void onApply() {
        if (application != null) {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;

            if (AppData.user.isJobSeeker()) {
                if (!jobSeeker.isActive()) {
                    Popup popup = new Popup(getContext(), R.string.to_message_account_activate, true);
                    popup.addGreenButton(R.string.activate, view -> {
                        TalentProfileFragment fragment1 = new TalentProfileFragment();
                        getApp().pushFragment(fragment1);
                    });
                    popup.addGreyButton(R.string.cancel, null);
                    popup.show();
                } else {
                    getApp().pushFragment(fragment);
                }
            }

        } else {
            if (!AppData.jobSeeker.isActive()) {
                Popup popup = new Popup(getContext(), R.string.to_apply_account_activate, true);
                popup.addGreenButton(R.string.activate, view -> showProfile());
                popup.addGreyButton(R.string.cancel, null);
                popup.show();
                return;
            }

            if (AppData.jobSeeker.getProfile_image() == null && AppData.jobSeeker.getPitch() == null) {
                Popup popup = new Popup(getContext(), R.string.to_apply_set_photo, true);
                popup.addGreenButton(R.string.edit_profile, view -> showProfile());
                popup.addGreyButton(R.string.cancel, null);
                popup.show();
                return;
            }

            if (job.getRequires_cv() && AppData.jobSeeker.getCV() == null) {
                Popup popup = new Popup(getContext(), R.string.job_requires_cv, true);
                popup.addGreenButton(R.string.edit_profile, view -> showProfile());
                popup.addGreyButton(R.string.cancel, null);
                popup.show();
                return;
            }

            JobApplyFragment fragment = new JobApplyFragment();
            fragment.job = job;
            fragment.callback = () -> {
                action.apply();
                getApp().popFragment();
            };
            getApp().pushFragment(fragment);
        }
    }

    @OnClick(R.id.remove_button)
    void onRemove() {
        Popup popup = new Popup(getContext(), R.string.not_interested_job, true);
        popup.addYellowButton(R.string.im_sure, view -> {
            action.remove();
            getApp().popFragment();
        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            String link = String.format("%sjobseeker/jobs/%d", MJPApi.apiUrl, job.getId());
            Intent sharingIntent = new Intent(Intent.ACTION_SEND);
            sharingIntent.setType("text/html");
            sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
            startActivity(Intent.createChooser(sharingIntent,getString(R.string.share_using)));
        }
    }

    class JobResourcePagerAdapter extends PagerAdapter implements ViewPager.OnPageChangeListener {

        @Override
        public Object instantiateItem(ViewGroup container, int position) {
            ViewGroup layout = (ViewGroup) LayoutInflater.from(getContext()).inflate(R.layout.view_job_resource, container, false);

            final JobResourceModel model = resources.get(position);

            View imageContainer = layout.findViewById(R.id.image_container);
            if (model.thumbnail != null) {
                AppHelper.loadImage(model.thumbnail, imageContainer);
            } else {
                if (model.isLogo) {
                    AppHelper.getImageView(imageContainer).setImageResource(R.drawable.default_logo);
                }
            }

            imageContainer.setOnClickListener(v -> {
                if (model.video != null) {
                    Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
                    intent.putExtra(MediaPlayerActivity.PATH, model.video);
                    startActivity(intent);
                } else {
                    new PhotoView(getApp(), model.image != null ? model.image : "res:///" + R.drawable.default_logo)
                            .show();
                }
            });

            View playIcon = layout.findViewById(R.id.play_icon);
            playIcon.setVisibility(model.video == null ? View.GONE : View.VISIBLE);

            AppHelper.getImageView(imageContainer).setScaleType(model.isLogo ? ImageView.ScaleType.FIT_CENTER : ImageView.ScaleType.CENTER_CROP);

            ViewGroup.LayoutParams layoutParams = imageContainer.getLayoutParams();
            if (model.isLogo) {
                int d = (int) (container.getWidth() * 0.25);
                layoutParams.width = d;
                layoutParams.height = d;
            } else {
                layoutParams.width = ViewGroup.LayoutParams.MATCH_PARENT;
                layoutParams.height = ViewGroup.LayoutParams.MATCH_PARENT;
            }
            imageContainer.setLayoutParams(layoutParams);

            container.addView(layout);

            return layout;
        }

        @Override
        public void destroyItem(ViewGroup container, int position, Object view) {
            container.removeView((View) view);
        }

        @Override
        public int getCount() {
            return resources.size();
        }

        @Override
        public boolean isViewFromObject(View view, Object object) {
            return view == object;
        }

        @Override
        public int getItemPosition(Object object){
            return POSITION_NONE;
        }

        @Override
        public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
        }

        @Override
        public void onPageSelected(int position) {
        }

        @Override
        public void onPageScrollStateChanged(int state) {
            if (state == ViewPager.SCROLL_STATE_IDLE) {
            }
        }

    }

}
