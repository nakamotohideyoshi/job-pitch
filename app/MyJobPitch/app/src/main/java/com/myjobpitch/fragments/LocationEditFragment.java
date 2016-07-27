package com.myjobpitch.fragments;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.common.api.PendingResult;
import com.google.android.gms.common.api.ResolvingResultCallbacks;
import com.google.android.gms.common.api.ResultCallback;
import com.google.android.gms.common.api.ResultCallbacks;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.places.Place;
import com.google.android.gms.location.places.PlaceLikelihood;
import com.google.android.gms.location.places.PlaceLikelihoodBuffer;
import com.google.android.gms.location.places.Places;
import com.google.android.gms.maps.model.LatLng;
import com.myjobpitch.R;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class LocationEditFragment extends EditFragment<Location> implements GoogleApiClient.OnConnectionFailedListener{
    public static final int SELECT_LOCATION = 1000;

    private CheckBox mLocationMobilePublicView;
    private EditText mLocationNameView;
    private EditText mLocationDescView;
    private EditText mLocationEmailView;
    private EditText mLocationAddressView;
    private CheckBox mLocationEmailPublicView;
    private EditText mLocationTelephoneView;
    private CheckBox mLocationTelephonePublicView;
    private EditText mLocationMobileView;
    private View mPlaceButton;
    private TextView mPlaceView;
    private Double mLongitude;
    private Double mLatitude;
    private String mPlaceId = "";
    private String mPlaceName;
    private ImageEditFragment mImageEdit;
    private Location mLocation;
    private Uri mImageUri;
    private Uri mNoImageUri;
    private boolean mImageUriSet = false;
    private String mNoImageMessage;
    private float mNoImageAlpha;

    private GoogleApiClient mGoogleApiClient;

    public LocationEditFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_location_edit, container, false);

        mImageEdit = (ImageEditFragment) getChildFragmentManager().findFragmentById(R.id.image_edit_fragment);
        mImageEdit.setListener(new ImageEditFragment.ImageEditFragmentListener() {
            @Override
            public void onDelete() {
                AlertDialog.Builder builder = new AlertDialog.Builder(LocationEditFragment.this.getActivity());
                builder.setMessage(getString(R.string.delete_image_confirmation))
                        .setCancelable(false)
                        .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                                mImageUri = null;
                                loadImage();
                            }
                        })
                        .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                            }
                        }).create().show();
            }

            @Override
            public void onChange(Uri image) {
                mImageUri = image;
                loadImage();
            }
        });

        mLocationNameView = (EditText) view.findViewById(R.id.location_name);
        mLocationDescView = (EditText) view.findViewById(R.id.location_description);
        mLocationAddressView = (EditText) view.findViewById(R.id.location_address);
        mLocationEmailView = (EditText) view.findViewById(R.id.location_email);
        mLocationEmailPublicView = (CheckBox) view.findViewById(R.id.location_email_public);
        mLocationTelephoneView = (EditText) view.findViewById(R.id.location_telephone);
        mLocationTelephonePublicView = (CheckBox) view.findViewById(R.id.location_telephone_public);
        mLocationMobileView = (EditText) view.findViewById(R.id.location_mobile);
        mLocationMobilePublicView = (CheckBox) view.findViewById(R.id.location_mobile_public);
        mPlaceView = (TextView) view.findViewById(R.id.location_place);

        mPlaceButton = view.findViewById(R.id.location_place_button);
        mPlaceButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(getActivity(), SelectPlaceActivity.class);
                if (mPlaceId != null && !mPlaceId.isEmpty())
                    intent.putExtra(SelectPlaceActivity.PLACE_ID, mPlaceId);
                if (mLongitude != null)
                    intent.putExtra(SelectPlaceActivity.LONGITUDE, mLongitude);
                if (mLatitude != null)
                    intent.putExtra(SelectPlaceActivity.LATITUDE, mLatitude);
                if (mPlaceName != null)
                    intent.putExtra(SelectPlaceActivity.NAME, mPlaceName);
                startActivityForResult(intent, SELECT_LOCATION);
            }
        });

        Map<String, View> fields = new HashMap<>();
        fields.put("name", mLocationNameView);
        fields.put("description", mLocationDescView);
        fields.put("email", mLocationEmailView);
        fields.put("telephone", mLocationTelephoneView);
        fields.put("mobile", mLocationMobileView);
        setFields(fields);

        Collection<View> requiredFields = new ArrayList<>();
        requiredFields.add(mLocationNameView);
        requiredFields.add(mLocationDescView);
        requiredFields.add(mLocationEmailView);
        setRequiredFields(requiredFields);

        if (savedInstanceState != null && savedInstanceState.containsKey("mImageUri")) {
            mImageUri = savedInstanceState.getParcelable("mImageUri");
            mImageUriSet = true;
        }

        mGoogleApiClient = new GoogleApiClient.Builder(getContext())
                .addApi(Places.PLACE_DETECTION_API)
                .addApi(Places.GEO_DATA_API)
                .enableAutoManage(getActivity(), this)
                .build();

        Button autoLocationButton = (Button) view.findViewById(R.id.auto_location);
        autoLocationButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (ContextCompat.checkSelfPermission(getContext(),Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(getActivity(), new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 100);
                } else {
                    callPlaceDetectionApi();
                }
            }
        });

        return view;
    }


    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        switch (requestCode) {
            case 100:
                if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    callPlaceDetectionApi();
                }
                break;
        }
    }


    private void callPlaceDetectionApi() throws SecurityException {
        PendingResult<PlaceLikelihoodBuffer> result = Places.PlaceDetectionApi.getCurrentPlace(mGoogleApiClient, null);
        result.setResultCallback(new ResultCallback<PlaceLikelihoodBuffer>() {
            @Override
            public void onResult(@NonNull PlaceLikelihoodBuffer placeLikelihoods) {
                if (!placeLikelihoods.getStatus().isSuccess()) {
                    // Request did not complete successfully
                    GooglePlayServicesUtil.showErrorDialogFragment(placeLikelihoods.getStatus().getStatusCode(), getActivity(), 1);
                    placeLikelihoods.release();
                    return;
                }

                for (PlaceLikelihood placeLikelihood : placeLikelihoods) {
                    Place place = placeLikelihood.getPlace();
                    LatLng latLng = place.getLatLng();
                    mPlaceName = place.getName().toString();
                    mPlaceId = place.getId();
                    mLongitude = latLng.longitude;
                    mLatitude = latLng.latitude;
                    if (mPlaceName != null) {
                        if (mPlaceId == null || mPlaceId.isEmpty())
                            mPlaceView.setText(mPlaceName);
                        else
                            mPlaceView.setText(mPlaceName + " (from Google)");
                    }
                }
                placeLikelihoods.release();
            }
        });
    }

    public void onConnectionFailed(ConnectionResult connectionResult) {

    }




    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putParcelable("mImageUri", mImageUri);
    }

    public void load(Location location) {
        mLocation = location;
        mLocationNameView.setText(mLocation.getName());
        mLocationDescView.setText(mLocation.getDescription());
        mLocationAddressView.setText(mLocation.getAddress());
        mLocationEmailView.setText(mLocation.getEmail());
        mLocationEmailPublicView.setChecked(mLocation.getEmail_public());
        mLocationTelephoneView.setText(mLocation.getTelephone());
        mLocationTelephonePublicView.setChecked(mLocation.getTelephone_public());
        mLocationMobileView.setText(mLocation.getMobile());
        mLocationMobilePublicView.setChecked(mLocation.getMobile_public());
        mPlaceName = mLocation.getPlace_name();
        mPlaceId = mLocation.getPlace_id();
        mLongitude = mLocation.getLongitude();
        mLatitude = mLocation.getLatitude();

        if (mPlaceName != null) {
            if (mPlaceId == null || mPlaceId.isEmpty())
                mPlaceView.setText(mPlaceName);
            else
                mPlaceView.setText(mPlaceName + " (from Google)");
        }

        if (!mImageUriSet && mLocation.getImages() != null && !mLocation.getImages().isEmpty())
            mImageUri = Uri.parse(mLocation.getImages().get(0).getThumbnail());

        Business business = mLocation.getBusiness_data();
        if (business != null && business.getImages() != null && !business.getImages().isEmpty()) {
            mNoImageUri = Uri.parse(business.getImages().get(0).getThumbnail());
            mNoImageMessage = getString(R.string.image_set_by_business);
            mNoImageAlpha = 0.3f;
        } else {
            mNoImageMessage = getString(R.string.no_image);
            mNoImageAlpha = 1.0f;
        }
        loadImage();
    }

    private void loadImage() {
        mImageEdit.load(mImageUri, mNoImageUri, mNoImageMessage, mNoImageAlpha);
    }

    public void save(Location location) {
        location.setName(mLocationNameView.getText().toString());
        location.setDescription(mLocationDescView.getText().toString());
        location.setAddress(mLocationAddressView.getText().toString());
        location.setEmail(mLocationEmailView.getText().toString());
        location.setEmail_public(mLocationEmailPublicView.isChecked());
        location.setTelephone(mLocationTelephoneView.getText().toString());
        location.setTelephone_public(mLocationTelephonePublicView.isChecked());
        location.setMobile(mLocationMobileView.getText().toString());
        location.setMobile_public(mLocationMobilePublicView.isChecked());
        location.setPlace_name(mPlaceName);
        location.setPlace_id(mPlaceId);
        location.setLongitude(mLongitude);
        location.setLatitude(mLatitude);
        location.setPostcode_lookup(""); // Not available in android places API (9.0.0)
    }

    public void setEmail(String email) {
        ((TextView) getView().findViewById(R.id.location_email)).setText(email);
    }

    public CreateUpdateLocationTask getCreateLocationTask(MJPApi api, Location location) {
        CreateUpdateLocationTask task = new CreateUpdateLocationTask(api, location);
        task.addListener(this);
        return task;
    }

    public Uri getImageUri() {
        return mImageUri;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SELECT_LOCATION) {
            if (resultCode == Activity.RESULT_OK) {
                mPlaceName = data.getStringExtra(SelectPlaceActivity.NAME);
                mLatitude = data.getDoubleExtra(SelectPlaceActivity.LATITUDE, 0);
                mLongitude = data.getDoubleExtra(SelectPlaceActivity.LONGITUDE, 0);
                if (data.hasExtra(SelectPlaceActivity.ADDRESS)) {
                    final String address = data.getStringExtra(SelectPlaceActivity.ADDRESS).replace(", ", "\n");
                    if (!address.equals(mLocationAddressView.getText().toString())) {
                        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
                        builder.setMessage(getString(R.string.confirm_update_address, address))
                                .setCancelable(false)
                                .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int which) {
                                        mLocationAddressView.setText(address);
                                    }
                                })
                                .setNegativeButton(R.string.no_thanks, new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int id) {
                                        dialog.cancel();
                                    }
                                });
                        AlertDialog alert = builder.create();
                        alert.show();
                    }
                }
                if (data.hasExtra(SelectPlaceActivity.PLACE_ID))
                    mPlaceId = data.getStringExtra(SelectPlaceActivity.PLACE_ID);
                else
                    mPlaceId = "";
                if (mPlaceName.equals(getString(R.string.custom_location)))
                    mPlaceView.setText(mPlaceName);
                else
                    mPlaceView.setText(mPlaceName + " (from Google)");
                mPlaceView.setError(null);
            }
        } else {
            mImageEdit.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public boolean validateInput() {
        boolean success = super.validateInput();

        mPlaceView.setError(null);
        if (mLatitude == null) {
            success = false;
            mPlaceView.setError(getString(R.string.error_field_required));
        }

        return success;
    }

}
