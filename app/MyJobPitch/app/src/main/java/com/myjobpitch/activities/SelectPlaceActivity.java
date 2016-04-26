package com.myjobpitch.activities;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentSender;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Geocoder;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.app.DialogFragment;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.AutoCompleteTextView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.Toast;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResultCallback;
//import com.google.android.gms.identity.intents.Address;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.PlaceBuffer;
import com.google.android.gms.location.places.Places;
import com.google.android.gms.maps.CameraUpdate;
import com.google.android.gms.maps.CameraUpdateFactory;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.SupportMapFragment;
import com.google.android.gms.maps.model.CameraPosition;
import com.google.android.gms.maps.model.LatLng;
import com.google.android.gms.maps.model.LatLngBounds;
import com.google.android.gms.maps.model.MarkerOptions;

import com.myjobpitch.R;
import com.myjobpitch.google.PlaceAutocompleteAdapter;

import java.io.IOException;
import java.util.List;
import java.util.Locale;

public class SelectPlaceActivity extends ActionBarActivity implements GoogleApiClient.OnConnectionFailedListener, GoogleApiClient.ConnectionCallbacks, LocationListener, View.OnClickListener {

    private static final String STATE_RESOLVING_ERROR = "resolving_error";
    public static final String PLACE_ID = "place_id";
    public static final String NAME = "name";
    public static final String ADDRESS = "address";
    public static final String LATITUDE = "latitude";
    public static final String LONGITUDE = "longitude";

    ///julia_fix_168
    public static Double mLongitudeJob;
    public static Double mLatitudeJob;
    public static String mPlaceIdJob = "";
    public static String mPlaceNameJob = "";
    public static String mAddresseJob = "";
    public static String mPostCodeJob = "";
    //////////////////////////////////////////


    private GoogleMap mMap; // Might be null if Google Play services APK is not available.
    private AutoCompleteTextView mAutocompleteView;
    private PlaceAutocompleteAdapter mAdapter;
    private GoogleApiClient mGoogleApiClient;

    private LatLng mLatLng;
    private String mPlaceId;

    // Request code to use when launching the resolution activity
    private static final int REQUEST_RESOLVE_ERROR = 1001;
    // Unique tag for the error dialog fragment
    private static final String DIALOG_ERROR = "dialog_error";
    // Bool to track whether the app is already resolving an error
    private boolean mResolvingError = false;
    private Button mSelectButton;
    private String mName;
    private String mAddress;
    private View mAutocompleteContainerView;

    private EditText location_edit;
    private Button location_findBtn;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mResolvingError = savedInstanceState != null
                && savedInstanceState.getBoolean(STATE_RESOLVING_ERROR, false);

        setContentView(R.layout.activity_select_place);


        // Set up the Google API Client if it has not been initialised yet.
        if (mGoogleApiClient == null) {
            rebuildGoogleApiClient();
        }

        setUpMapIfNeeded();

        if (mMap == null)
            return;


        mAutocompleteContainerView = findViewById(R.id.location_search_container);
        mAutocompleteView = (AutoCompleteTextView) findViewById(R.id.location_search);
        mAutocompleteView.setOnItemClickListener(mAutocompleteClickListener);

        mAdapter = new PlaceAutocompleteAdapter(this, android.R.layout.simple_list_item_1,
                mMap.getProjection().getVisibleRegion().latLngBounds, null);
        mAutocompleteView.setAdapter(mAdapter);

        location_edit = (EditText) findViewById(R.id.location_edit);
        location_findBtn = (Button) findViewById(R.id.location_find);
        location_findBtn.setOnClickListener(this);


        // Set up the 'clear text' button that clears the text in the autocomplete view
        ImageButton clearButton = (ImageButton) findViewById(R.id.button_clear);
        clearButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mAutocompleteView.setText("");
            }
        });

        // Select button
        mSelectButton = (Button) findViewById(R.id.select_button);
        mSelectButton.setOnClickListener(this);
//        mSelectButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//                Log.e("!!!!!!!!!!", "ok!!!!");
//                if (mLatLng != null) {
//
//                    ///julia_fix_168
////                    mLongitudeJob = mLatLng.longitude;
////                    mLatitudeJob = mLatLng.latitude;
////                    mPlaceIdJob = mPlaceId;
////                    mPlaceNameJob = mName;
////                    mAddresseJob = mAddress;
//
//
////                    Log.e("---mLongitudeJob-------", String.valueOf(mLongitudeJob));
////                    Log.e("---mLatitudeJob-------", String.valueOf(mLatitudeJob));
////                    Log.e("----mPlaceIdJob------", String.valueOf(mPlaceIdJob));
////                    Log.e("------mPlaceNameJob----", String.valueOf(mPlaceNameJob));
//
//                    /////////////////////////////////////
//
//                    Intent intent = new Intent();
//                    intent.putExtra(LATITUDE, mLatLng.latitude);
//                    intent.putExtra(LONGITUDE, mLatLng.longitude);
//                    intent.putExtra(NAME, mName);
//                    if (mAddress != null)
//                        intent.putExtra(ADDRESS, mAddress);
//                    if (mPlaceId != null)
//                        intent.putExtra(PLACE_ID, mPlaceId);
//                    setResult(Activity.RESULT_OK, intent);
//                    finish();
//                }
//            }
//        });

        // Change maps padding on layout of top/bottom controls
        ViewTreeObserver.OnGlobalLayoutListener layoutListener = new ViewTreeObserver.OnGlobalLayoutListener() {
            int mTopPadding, mBottomPadding;
            final int extraPadding = (int) (5 * getResources().getDisplayMetrics().density + 0.5f);

            @Override
            public void onGlobalLayout() {
                int topPadding = mAutocompleteContainerView.getHeight() + extraPadding;
                int bottomPadding = mSelectButton.getHeight();
                if (topPadding != mTopPadding || bottomPadding != mBottomPadding) {
                    mTopPadding = topPadding;
                    mBottomPadding = bottomPadding;
                    mMap.setPadding(0, mTopPadding, 0, mBottomPadding);
                }
            }
        };

        mAutocompleteContainerView.getViewTreeObserver().addOnGlobalLayoutListener(layoutListener);
        mSelectButton.getViewTreeObserver().addOnGlobalLayoutListener(layoutListener);

        // If data passed, setup initial marker
        if (getIntent().hasExtra(NAME) && getIntent().hasExtra(LATITUDE) && getIntent().hasExtra(LONGITUDE)) {
            LatLng latLng = new LatLng(getIntent().getDoubleExtra(LATITUDE, 0), getIntent().getDoubleExtra(LONGITUDE, 0));
            String name = getIntent().getStringExtra(NAME);
            if (getIntent().hasExtra(PLACE_ID)) {
                updateLocation(latLng, name, getIntent().getStringExtra(PLACE_ID), null);
            } else {
                updateLocation(latLng, name);
            }
            //mSelectButton.setEnabled(false);
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setMessage(getString(R.string.select_place_explainer))
                .setCancelable(false)
                .setPositiveButton(getString(R.string.got_it), new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                }).create().show();
    }

    @Override
    public boolean onOptionsItemSelected(final MenuItem item) {
        Log.d("MJPActionBarActivity", "up");
        switch (item.getItemId()) {
            case android.R.id.home:
                onBackPressed();
                return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    protected void onStart() {

        if (!mResolvingError) {
            mGoogleApiClient.connect();
        }
        super.onStart();
    }

    @Override
    protected void onStop() {
        mGoogleApiClient.disconnect();
        super.onStop();
    }

    @Override
    protected void onResume() {
        super.onResume();
        setUpMapIfNeeded();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(STATE_RESOLVING_ERROR, mResolvingError);
    }

    /**
     * Sets up the map if it is possible to do so (i.e., the Google Play services APK is correctly
     * installed) and the map has not already been instantiated.. This will ensure that we only ever
     * call {@link #setUpMap()} once when {@link #mMap} is not null.
     * <p/>
     * If it isn't installed {@link SupportMapFragment} (and
     * {@link com.google.android.gms.maps.MapView MapView}) will show a prompt for the user to
     * install/update the Google Play services APK on their device.
     * <p/>
     * A user can return to this FragmentActivity after following the prompt and correctly
     * installing/updating/enabling the Google Play services. Since the FragmentActivity may not
     * have been completely destroyed during this process (it is likely that it would only be
     * stopped or paused), {@link #onCreate(Bundle)} may not be called again so we should call this
     * method in {@link #onResume()} to guarantee that it will be called.
     */
    private void setUpMapIfNeeded() {
        // Do a null check to confirm that we have not already instantiated the map.
        if (mMap == null) {
            // Try to obtain the map from the SupportMapFragment.
            mMap = ((SupportMapFragment) getSupportFragmentManager().findFragmentById(R.id.map))
                    .getMap();

            // Check if we were successful in obtaining the map.
            if (mMap == null) {
                finish();
                Toast.makeText(this, R.string.map_error, Toast.LENGTH_LONG).show();
            } else
                setUpMap();
        }
    }


    private AdapterView.OnItemClickListener mAutocompleteClickListener
            = new AdapterView.OnItemClickListener() {
        @Override
        public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
            /*
             Retrieve the place ID of the selected item from the Adapter.
             The adapter stores each Place suggestion in a PlaceAutocomplete object from which we
             read the place ID.
              */
            final PlaceAutocompleteAdapter.PlaceAutocomplete item = mAdapter.getItem(position);
            final String placeId = String.valueOf(item.placeId);
            Log.i("SelectPlaceActivity", "Autocomplete item selected: " + item.description);

            /*
             Issue a request to the Places Geo Data API to retrieve a Place object with additional
              details about the place.
              */
            PendingResult<PlaceBuffer> placeResult = Places.GeoDataApi
                    .getPlaceById(mGoogleApiClient, placeId);
            placeResult.setResultCallback(mUpdatePlaceDetailsCallback);

            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(mAutocompleteView.getWindowToken(), 0);
        }
    };

    private ResultCallback<PlaceBuffer> mUpdatePlaceDetailsCallback
            = new ResultCallback<PlaceBuffer>() {
        @Override
        public void onResult(PlaceBuffer places) {
            if (!places.getStatus().isSuccess()) {
                // Request did not complete successfully
                Log.e("SelectPlaceActivity", "Place query did not complete. Error: " + places.getStatus().toString());
                places.release();
                return;
            }
            // Get the Place object from the buffer.
            final Place place = places.get(0);
            updateLocation(place.getLatLng(), place.getName().toString(), place.getId(), place.getAddress().toString());
            places.release();
        }
    };

    private void updateLocation(LatLng latLng, String title) {
        updateLocation(latLng, title, null, null);
    }

    private void updateLocation(LatLng latLng, String title, String placeId, String address) {
        mPlaceId = placeId;
        mLatLng = latLng;
        mName = title;
        mPostCodeJob = "";
        mAddress = address;
        mMap.clear();
        mMap.addMarker(new MarkerOptions()
                .position(latLng)
                .title(title));
        CameraUpdate cameraUpdate = CameraUpdateFactory.newLatLngZoom(latLng, 17);
        mMap.animateCamera(cameraUpdate);
        mSelectButton.setEnabled(true);
    }


    /**
     * Construct a GoogleApiClient for the {@link Places#GEO_DATA_API} using AutoManage
     * functionality.
     * This automatically sets up the API client to handle Activity lifecycle events.
     */
    private void rebuildGoogleApiClient() {
        // When we build the GoogleApiClient we specify where connected and connection failed
        // callbacks should be returned and which Google APIs our app uses.
        mGoogleApiClient = new GoogleApiClient.Builder(this)
                .addConnectionCallbacks(this)
                .addApi(Places.GEO_DATA_API)
                .addApi(LocationServices.API)
                .build();

    }


    /**
     * This is where we can add markers or lines, add listeners or move the camera. In this case, we
     * just add a marker near Africa.
     * <p/>
     * This should only be called once and when we are sure that {@link #mMap} is not null.
     */
    private void setUpMap() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return;
        }
        mMap.setMyLocationEnabled(true);
        mMap.getUiSettings().setMapToolbarEnabled(false);
        mMap.getUiSettings().setZoomControlsEnabled(true);
        mMap.getUiSettings().setTiltGesturesEnabled(false);
        mMap.getUiSettings().setRotateGesturesEnabled(false);
        mMap.getUiSettings().setMyLocationButtonEnabled(true);
        mMap.setOnCameraChangeListener(new GoogleMap.OnCameraChangeListener() {
            @Override
            public void onCameraChange(CameraPosition position) {
                LatLngBounds bounds = mMap.getProjection().getVisibleRegion().latLngBounds;
                if (mAdapter != null)
                    mAdapter.setBounds(bounds);
            }
        });
        mMap.setOnMapLongClickListener(new GoogleMap.OnMapLongClickListener() {
            @Override
            public void onMapLongClick(LatLng latLng) {
                updateLocation(latLng, getString(R.string.custom_location));
            }
        });


    }

    ///julia_kata_168
    private GoogleMap.OnMyLocationChangeListener myLocationChangeListener = new GoogleMap.OnMyLocationChangeListener() {
        @Override
        public void onMyLocationChange(Location location) {
            LatLng loc = new LatLng(location.getLatitude(), location.getLongitude());
            mMap.addMarker(new MarkerOptions().position(loc));
            if (mMap != null) {
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(loc, 16.0f));
            }
        }
    };
    /////////////////////////////////////////////////


    @Override
    public void onConnectionFailed(ConnectionResult result) {
        if (mResolvingError) {
            // Already attempting to resolve an error.
            return;
        } else if (result.hasResolution()) {
            try {
                mResolvingError = true;
                result.startResolutionForResult(this, REQUEST_RESOLVE_ERROR);
            } catch (IntentSender.SendIntentException e) {
                // There was an error with the resolution intent. Try again.
                mGoogleApiClient.connect();
            }
        } else {
            // Show dialog using GooglePlayServicesUtil.getErrorDialog()
            showErrorDialog(result.getErrorCode());
            mResolvingError = true;
        }
        mAdapter.setGoogleApiClient(null);
    }


    public void onConnected(Bundle bundle) {
        mAdapter.setGoogleApiClient(mGoogleApiClient);
        Log.d("SelectPlaceActivity", "onConnected");

        // Try to get current location, and move map there, if no marker placed
        if (mLatLng == null) {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return;
            }
            Location location = LocationServices.FusedLocationApi.getLastLocation(mGoogleApiClient);
            if (location != null) {
                LatLng latLng = new LatLng(location.getLatitude(), location.getLongitude());
                mLatLng = latLng;


                Geocoder geocoder;
                List<android.location.Address> addresses;
                geocoder = new Geocoder(this, Locale.getDefault());

                try {
                    addresses = geocoder.getFromLocation(mLatLng.latitude, mLatLng.longitude, 1);

                    mName = addresses.get(0).getCountryName();
                    mPlaceId = addresses.get(0).getAddressLine(0);
                    mAddress = addresses.get(0).getAddressLine(1);
                    for(int i=0 ;i<addresses.size();i++){
                        if (addresses.get(i).getPostalCode()!=null){
                            mPostCodeJob = addresses.get(0).getPostalCode();
                        }
                    }



                } catch (IOException e) {
                    e.printStackTrace();
                }
                //////////////////////////////////////////////////////////////////////////////////

                CameraUpdate cameraUpdate = CameraUpdateFactory.newLatLngZoom(latLng, 17);
                mMap.animateCamera(cameraUpdate);
            }
        }
    }


    @Override
    public void onConnectionSuspended(int i) {
        mAdapter.setGoogleApiClient(null);
        Log.d("SelectPlaceActivity", "onConnectionSuspended");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQUEST_RESOLVE_ERROR) {
            mResolvingError = false;
            if (resultCode == RESULT_OK) {
                // Make sure the app is not already connected or attempting to connect
                if (!mGoogleApiClient.isConnecting() &&
                        !mGoogleApiClient.isConnected()) {
                    mGoogleApiClient.connect();
                }
            }
        }
    }

    // The rest of this code is all about building the error dialog

    /* Creates a dialog for an error message */
    private void showErrorDialog(int errorCode) {
        // Create a fragment for the error dialog
        ErrorDialogFragment dialogFragment = new ErrorDialogFragment();
        // Pass the error that should be displayed
        Bundle args = new Bundle();
        args.putInt(DIALOG_ERROR, errorCode);
        dialogFragment.setArguments(args);
        dialogFragment.show(getSupportFragmentManager(), "errordialog");
    }

    /* Called from ErrorDialogFragment when the dialog is dismissed. */
    public void onDialogDismissed() {
        mResolvingError = false;
    }

    @Override
    public void onLocationChanged(Location location) {
        // Getting latitude of the current location
        double latitude = location.getLatitude();

        // Getting longitude of the current location
        double longitude = location.getLongitude();

        // Creating a LatLng object for the current location
        mLatLng = new LatLng(latitude, longitude);

        Geocoder geocoder;
        List<android.location.Address> addresses;
        geocoder = new Geocoder(this, Locale.getDefault());

        try {
            addresses = geocoder.getFromLocation(latitude, longitude, 1);


                mName = addresses.get(0).getCountryName();
                mPlaceId = addresses.get(0).getAddressLine(0);
                mAddress = addresses.get(0).getAddressLine(1);
                for(int i=0 ;i<addresses.size();i++){
                    if (addresses.get(i).getPostalCode()!=null){
                        mPostCodeJob = addresses.get(0).getPostalCode();
                    }
                }


        } catch (IOException e) {
            e.printStackTrace();
        }

        // Showing the current location in Google Map
        mMap.moveCamera(CameraUpdateFactory.newLatLng(mLatLng));

        // Zoom in the Google Map
        mMap.animateCamera(CameraUpdateFactory.zoomTo(15));
        Log.e("**************", String.valueOf(latitude));


    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(String provider) {

    }

    @Override
    public void onProviderDisabled(String provider) {

    }

    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.location_find){
            String location = location_edit.getText().toString();
            Log.e("location--",location);

            if(location!=null && !location.equals("")){
                //new GeocoderTask().execute(location);
                Geocoder geocoder = new Geocoder(getBaseContext());
                List<android.location.Address> addresses = null;

                try {
                    // Getting a maximum of 3 Address that matches the input text
                    addresses = geocoder.getFromLocationName(location, 3);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                // Clears all the existing markers on the map
                mMap.clear();

                // Adding Markers on Google Map for each matching address
                for(int i=0;i<addresses.size();i++){

                    android.location.Address address = (android.location.Address) addresses.get(i);

                    // Creating an instance of GeoPoint, to display in Google Map
                    mLatLng = new LatLng(address.getLatitude(), address.getLongitude());

                    String addressText = String.format("%s, %s",
                            address.getMaxAddressLineIndex() > 0 ? address.getAddressLine(0) : "",
                            address.getCountryName());
                    Log.e("addresstext***", addressText);

                    MarkerOptions markerOptions = new MarkerOptions();
                    markerOptions.position(mLatLng);
                    markerOptions.title(addressText);

                    mMap.addMarker(markerOptions);
                    mName = address.getAddressLine(0);
                    mAddress= address.getAddressLine(1);
                    mPlaceId = address.getAddressLine(2);

                    // Locate the first location
                    if(i==0)
                        mMap.animateCamera(CameraUpdateFactory.newLatLng(mLatLng));
                }
            }
        }
        if (v.getId() == R.id.select_button){
            Log.e("!!!!!!!!!!", "ok!!!!");
            if (mLatLng != null) {

                Intent intent = new Intent();
                intent.putExtra(LATITUDE, mLatLng.latitude);
                intent.putExtra(LONGITUDE, mLatLng.longitude);
                intent.putExtra(NAME, mName);
                if (mAddress != null)
                    intent.putExtra(ADDRESS, mAddress);
                if (mPlaceId != null)
                    intent.putExtra(PLACE_ID, mPlaceId);
                setResult(Activity.RESULT_OK, intent);
                finish();
            }
        }


    }

    /* A fragment to display an error dialog */
    public static class ErrorDialogFragment extends DialogFragment {
        public ErrorDialogFragment() { }

        @Override
        public Dialog onCreateDialog(Bundle savedInstanceState) {
            // Get the error code and retrieve the appropriate dialog
            int errorCode = this.getArguments().getInt(DIALOG_ERROR);
            return GooglePlayServicesUtil.getErrorDialog(errorCode,
                    this.getActivity(), REQUEST_RESOLVE_ERROR);
        }

        @Override
        public void onDismiss(DialogInterface dialog) {
            ((SelectPlaceActivity)getActivity()).onDialogDismissed();
        }
    }




}
