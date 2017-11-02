package com.myjobpitch;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.ui.PlaceAutocompleteFragment;
import com.google.android.gms.location.places.ui.PlaceSelectionListener;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.LatLng;
import com.myjobpitch.utils.Loading;

import java.io.IOException;
import java.util.List;


public class SelectPlaceActivity extends FragmentActivity implements GoogleMap.OnCameraIdleListener, PlaceSelectionListener, GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {

    public static final String LATITUDE = "latitude";
    public static final String LONGITUDE = "longitude";
    public static final String ADDRESS = "address";

    GoogleMap mMap;
    LatLng mCurrentPos;
    GoogleApiClient mGoogleApiClient;

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

                if (ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                        ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    String[] permissions = {android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION};
                    ActivityCompat.requestPermissions(SelectPlaceActivity.this, permissions, 10000);
                } else {
                    createGoogleApiClient();
                }
            }
        });

        PlaceAutocompleteFragment autocompleteFragment = (PlaceAutocompleteFragment)
                getFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);
        autocompleteFragment.setOnPlaceSelectedListener(this);

    }

    void settingMap() {
        mMap.setOnCameraIdleListener(this);

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
        }
    }

    private void createGoogleApiClient() {

        if (ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        } else {
            mMap.setMyLocationEnabled(true);
            mMap.getUiSettings().setMyLocationButtonEnabled(true);
        }

//        Loading.show(this, "Loading...");
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addConnectionCallbacks(this)
                .addOnConnectionFailedListener(this)
                .addApi(LocationServices.API)
                .build();
        mGoogleApiClient.connect();
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
    public void onConnected(Bundle connectionHint) {
        if (ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ActivityCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
        } else {
            if (getIntent().hasExtra(LATITUDE)) {
            } else {
                Location location = LocationServices.FusedLocationApi.getLastLocation(
                        mGoogleApiClient);
                mCurrentPos = new LatLng(location.getLatitude(), location.getLongitude());
                mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(mCurrentPos, 14));
            }
        }

//        Loading.hide();
        mGoogleApiClient.disconnect();
        mGoogleApiClient = null;
    }

    @Override
    public void onConnectionSuspended(int var1) {
    }

    @Override
    public void onConnectionFailed(@NonNull ConnectionResult var1) {
//        Loading.hide();
        mGoogleApiClient.disconnect();
        mGoogleApiClient = null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        for (int permission : grantResults) {
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }
        if (requestCode == 10000) {
            createGoogleApiClient();
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
