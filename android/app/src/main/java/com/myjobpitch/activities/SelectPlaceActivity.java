package com.myjobpitch.activities;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.location.Address;
import android.location.Geocoder;
import android.location.Location;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.FragmentActivity;
import android.os.Bundle;
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
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.Circle;
import com.google.android.gms.maps.model.CircleOptions;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.Marker;
import com.google.android.gms.maps.model.MarkerOptions;
import com.myjobpitch.R;
import com.myjobpitch.views.Popup;

import java.io.IOException;
import java.util.List;


public class SelectPlaceActivity extends FragmentActivity implements GoogleMap.OnMapClickListener, PlaceSelectionListener, GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {

    public static final String LATITUDE = "latitude";
    public static final String LONGITUDE = "longitude";
    public static final String COUNTRY = "country";
    public static final String REGION = "region";
    public static final String CITY = "city";
    public static final String STREET = "street";
    public static final String POSTCODE = "postcode";
    public static final String ADDRESS = "address";
    public static final String RADIUS = "radius";

    GoogleMap mMap;
    LatLng mCurrentPos;
    GoogleApiClient mGoogleApiClient;

    double radius;
    Marker marker;
    Circle circle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_select_place);

        radius = getIntent().getDoubleExtra(RADIUS, 0);

        SupportMapFragment mapFragment = (SupportMapFragment) getSupportFragmentManager()
                .findFragmentById(R.id.map);
        mapFragment.getMapAsync(googleMap -> {
            mMap = googleMap;
            settingMap();

            if (ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                    ActivityCompat.checkSelfPermission(SelectPlaceActivity.this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                String[] permissions = {android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION};
                ActivityCompat.requestPermissions(SelectPlaceActivity.this, permissions, 10000);
            } else {
                createGoogleApiClient();
            }
        });

        PlaceAutocompleteFragment autocompleteFragment = (PlaceAutocompleteFragment)
                getFragmentManager().findFragmentById(R.id.place_autocomplete_fragment);
        autocompleteFragment.setOnPlaceSelectedListener(this);

        Popup popup = new Popup(this, R.string.google_map_message, true);
        popup.addGreyButton(R.string.got_it, null);
        popup.show();
    }

    void settingMap() {
        mMap.setOnMapClickListener(this);

        final int d = (int) (50 * getResources().getDisplayMetrics().density);
        mMap.setPadding(0, d, 0, d);

        final Button selectButton = findViewById(R.id.select_button);
        selectButton.setOnClickListener(v -> selectLocation());

        if (getIntent().hasExtra(LATITUDE)) {
            updatePosition(getIntent().getDoubleExtra(LATITUDE, 0), getIntent().getDoubleExtra(LONGITUDE, 0));
            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(mCurrentPos, getZoom()));
        }
    }

    void updatePosition(double latitude, double longitude) {
        mCurrentPos = new LatLng(latitude, longitude);

        if (marker == null) {
            marker = mMap.addMarker(new MarkerOptions().position(mCurrentPos));
        } else {
            marker.setPosition(mCurrentPos);
        }

        if (radius != 0) {
            if (circle == null) {
                circle = mMap.addCircle(new CircleOptions()
                        .radius(radius)
                        .strokeWidth(2)
                        .strokeColor(Color.argb(255, 0, 182, 164))
                        .fillColor(Color.argb(51, 255, 147, 0))
                        .center(mCurrentPos));
            } else {
                circle.setCenter(mCurrentPos);
            }
        }
    }

    float getZoom() {
        if (radius == 0 && marker != null) {
            return 14;
        }
        if (radius < 2000) {
            return 13;
        }
        if (radius < 4000) {
            return 12;
        }
        if (radius < 10000) {
            return 11;
        }
        if (radius < 20000) {
            return 10;
        }
        return 7;
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
        String country = null,
                region = null,
                city = null,
                street = null,
                postcode = null,
                line = null;

        try {
            List<Address> addresses = geocoder.getFromLocation(mCurrentPos.latitude, mCurrentPos.longitude, 1);
            if (addresses.size() > 0) {
                Address address = addresses.get(0);
                country = address.getCountryName();
                region = address.getAdminArea();
                city = address.getLocality();
                street = address.getThoroughfare();
                postcode = address.getPostalCode();
                line = address.getAddressLine(0);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        Intent intent = new Intent();
        intent.putExtra(LATITUDE, mCurrentPos.latitude);
        intent.putExtra(LONGITUDE, mCurrentPos.longitude);
        intent.putExtra(COUNTRY, country);
        intent.putExtra(REGION, region);
        intent.putExtra(CITY, city);
        intent.putExtra(STREET, street);
        intent.putExtra(POSTCODE, postcode);
        intent.putExtra(ADDRESS, line);
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
                if (location != null) {
                    updatePosition(location.getLatitude(), location.getLongitude());
                    mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(mCurrentPos, getZoom()));
                }
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
    public void onMapClick(LatLng latLng) {
        updatePosition(latLng.latitude, latLng.longitude);
    }

    @Override
    public void onPlaceSelected(Place place) {
        LatLng latLng = place.getLatLng();
        updatePosition(latLng.latitude, latLng.longitude);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(place.getLatLng(), getZoom()));
    }

    @Override
    public void onError(Status status) {
        Toast.makeText(this, "Place selection failed: " + status.getStatusMessage(),
                Toast.LENGTH_SHORT).show();
    }

}
