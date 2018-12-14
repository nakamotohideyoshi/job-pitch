package com.myjobpitch.pages.employees;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.MapView;
import com.google.android.gms.maps.MapsInitializer;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Employee;
import com.myjobpitch.fragments.BaseFragment;

import butterknife.BindView;
import butterknife.ButterKnife;

public class EmployeeDetailsFragment extends BaseFragment {

    @BindView(R.id.job_title)
    TextView titleView;

    @BindView(R.id.job_subtitle)
    TextView subtitleView;

    @BindView(R.id.job_desc)
    TextView jobDescView;

    @BindView(R.id.workplace_desc)
    TextView workplaceDescView;

    @BindView(R.id.map_view)
    MapView mapView;

    GoogleMap googleMap;

    public Employee employee;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_employee_details, container, false);
        ButterKnife.bind(this, view);

        title = "Employee Details";

        // map setting

        mapView.onCreate(savedInstanceState);
        mapView.onResume();

        try {
            MapsInitializer.initialize(getActivity().getApplicationContext());
        } catch (Exception e) {
            e.printStackTrace();
        }

        titleView.setText(employee.getJob().getTitle());
        jobDescView.setText(employee.getJob().getDescription());

        mapView.getMapAsync(map -> {
            googleMap = map;
            googleMap.getUiSettings().setMyLocationButtonEnabled(false);
        });

        return view;
    }
}
