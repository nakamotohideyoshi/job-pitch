package com.myjobpitch.fragments;

import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.MarkerOptions;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;
import com.myjobpitch.views.PhotoView;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ApplicationDetailFragment extends BaseFragment {

    @BindView(R.id.job_image_view)
    View logoView;

    @BindView(R.id.job_title)
    TextView titleView;

    @BindView(R.id.job_subtitle)
    TextView subtitleView;

    @BindView(R.id.job_attributes)
    TextView attributesView;

    @BindView(R.id.job_distance)
    TextView distanceView;

    @BindView(R.id.job_desc)
    TextView descView;

    @BindView(R.id.apply_button)
    Button applyButton;
    @BindView(R.id.remove_button)
    Button removeButton;

    @BindView(R.id.location_desc)
    TextView locationDescView;

    @BindView(R.id.map_view)
    MapView mapView;

    GoogleMap googleMap;

    JobSeeker jobSeeker;
    JobProfile profile;

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

        title = "Job Detail";

        // map setting

        mapView.onCreate(savedInstanceState);
        mapView.onResume();

        try {
            MapsInitializer.initialize(getActivity().getApplicationContext());
        } catch (Exception e) {
            e.printStackTrace();
        }

        // load data

        if (application != null) {
            job = application.getJob_data();
        }

        view.setVisibility(View.INVISIBLE);
        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
            }
            @Override
            protected void onSuccess() {
                view.setVisibility(View.VISIBLE);
                load();
            }
        };

        return view;

    }

    void load() {

        AppHelper.loadJobLogo(job, AppHelper.getImageView(logoView));

        Location location = job.getLocation_data();
        Contract contract = AppData.get(Contract.class, job.getContract());
        Hours hours = AppData.get(Hours.class, job.getHours());

        titleView.setText(job.getTitle());
        distanceView.setText(AppHelper.distance(profile.getLatitude(), profile.getLongitude(), location.getLatitude(), location.getLongitude()));
        subtitleView.setText(AppHelper.getBusinessName(job));

        attributesView.setText(hours.getName());
        if (contract.getId() == AppData.get(Contract.class, Contract.PERMANENT).getId()) {
            attributesView.setText(String.format("%s (%s)", hours.getName(), contract.getName()));
        } else {
            attributesView.setText(hours.getName());
        }

        descView.setText(job.getDescription());
        locationDescView.setText(location.getDescription());

        if (viewMode) {
            applyButton.setVisibility(View.GONE);
            removeButton.setVisibility(View.GONE);
        } else if (application != null) {
            applyButton.setText("Message");
            removeButton.setVisibility(View.GONE);
        }

        mapView.getMapAsync(new OnMapReadyCallback() {
            @Override
            public void onMapReady(GoogleMap map) {
                googleMap = map;
                googleMap.getUiSettings().setMyLocationButtonEnabled(false);
                Location location = job.getLocation_data();
                LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
                googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(latLng, 15));
                googleMap.addMarker(new MarkerOptions().position(latLng));
            }
        });

    }

    @OnClick(R.id.job_image_view)
    void onClickImage() {

        String path = "res:///" + R.drawable.default_logo;
        if (job.getImages().size() > 0) {
            path = job.getImages().get(0).getImage();
        } else {
            Location location = job.getLocation_data();
            if (location.getImages().size() > 0) {
                path = location.getImages().get(0).getImage();
            } else {
                Business business = location.getBusiness_data();
                if (business.getImages().size() > 0) {
                    path = business.getImages().get(0).getImage();
                }
            }
        }

        new PhotoView(getApp(), path)
                .show();
    }

    @OnClick(R.id.apply_button)
    void onApply() {
        if (application != null) {
            MessageFragment fragment = new MessageFragment();
            fragment.application = application;
            getApp().pushFragment(fragment);
        } else {
            if (jobSeeker.getPitch() == null) {
                Popup.showGreen("You need to record your pitch video to apply.", "Record my pitch", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
                    }
                }, "Cancel", null, true);
            } else {
                Popup.showYellow("Are you sure you want to apply to this job?", "Apply", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        new APITask("") {
                            @Override
                            protected void runAPI() throws MJPApiException {
                                ApplicationForCreation applicationForCreation = new ApplicationForCreation();
                                applicationForCreation.setJob(job.getId());
                                applicationForCreation.setJob_seeker(jobSeeker.getId());
                                applicationForCreation.setShortlisted(false);
                                MJPApi.shared().create(ApplicationForCreation.class, applicationForCreation);
                            }
                            @Override
                            protected void onSuccess() {
                                action.apply();
                                getApp().popFragment();
                            }
                        };
                    }
                }, "Cancel", null, true);
            }
        }
    }

    @OnClick(R.id.remove_button)
    void onRemove() {
        Popup.showYellow("Are you sure you are not interested in this job?", "I'm Sure", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                action.remove();
                getApp().popFragment();
            }
        }, "Cancel", null, true);
    }

}
