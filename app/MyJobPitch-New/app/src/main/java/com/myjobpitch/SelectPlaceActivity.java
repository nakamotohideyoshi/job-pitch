package com.myjobpitch;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.ui.PlaceAutocompleteFragment;
import com.google.android.gms.location.places.ui.PlaceSelectionListener;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;

import java.io.IOException;
import java.util.List;


public class SelectPlaceActivity extends FragmentActivity implements GoogleMap.OnCameraIdleListener, PlaceSelectionListener {

    public static final String LATITUDE = "latitude";
    public static final String LONGITUDE = "longitude";
    public static final String ADDRESS = "address";

    GoogleMap mMap;
    LatLng mCurrentPos;
    boolean myLocation = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_place);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(new OnMapReadyCallback() {
            @Override
            public void onMapReady(GoogleMap googleMap) {
                mMap = googleMap;
                settingMap();
            }
        });

        PlaceAutocompleteFragment autocompleteFragment = (PlaceAutocompleteFragment)
                getFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);
        autocompleteFragment.setOnPlaceSelectedListener(this);

    }

    void settingMap() {
        if (ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            String[] permissions = {android.Manifest.permission.ACCESS_FINE_LOCATION};
            ActivityCompat.requestPermissions(SelectPlaceActivity.this, permissions, 10000);
            return;
        }
        mMap.setMyLocationEnabled(true);
        mMap.setOnCameraIdleListener(this);
        mMap.getUiSettings().setMyLocationButtonEnabled(true);

        final int d = (int) (50 * getResources().getDisplayMetrics().density);
        mMap.setPadding(0, d, 0, d);

        final Button selectButton = (Button)findViewById(R.id.select_button);
        selectButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selectLocation();
            }
        });

        if (getIntent().hasExtra(LATITUDE)) {
            mCurrentPos = new LatLng(getIntent().getDoubleExtra(LATITUDE, 0), getIntent().getDoubleExtra(LONGITUDE, 0));
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(mCurrentPos, 14));
            selectButton.setEnabled(true);
            selectButton.setAlpha(1);
        } else {
            mMap.setOnMyLocationChangeListener(new GoogleMap.OnMyLocationChangeListener() {
                @Override
                public void onMyLocationChange(Location location) {
                    if (!myLocation) {
                        myLocation = true;
                        mCurrentPos = new LatLng(location.getLatitude(), location.getLongitude());
                        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(mCurrentPos, 14));
                        selectButton.setEnabled(true);
                        selectButton.setAlpha(1);
                    }
                }
            });
        }

    }

    void selectLocation() {
        Geocoder geocoder = new Geocoder(this);
        String str = "address unknown";
        try {
            List<Address> addresses = geocoder.getFromLocation(mCurrentPos.latitude, mCurrentPos.longitude, 1);
            if (addresses.size() > 0) {
                str = addresses.get(0).getAddressLine(0);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        Intent intent = new Intent();
        intent.putExtra(LATITUDE, mCurrentPos.latitude);
        intent.putExtra(LONGITUDE, mCurrentPos.longitude);
        intent.putExtra(ADDRESS, str);
        setResult(RESULT_OK, intent);
        finish();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        if (requestCode == 10000) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                settingMap();
            }
        }
    }

    @Override
    public void onCameraIdle() {
        mCurrentPos = mMap.getCameraPosition().target;
    }

    @Override
    public void onPlaceSelected(Place place) {
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(place.getLatLng(), 14));
    }

    @Override
    public void onError(Status status) {
        Toast.makeText(this, "Place selection failed: " + status.getStatusMessage(),
                Toast.LENGTH_SHORT).show();
    }

}
