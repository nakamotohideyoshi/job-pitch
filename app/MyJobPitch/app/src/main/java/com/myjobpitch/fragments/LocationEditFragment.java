package com.myjobpitch.fragments;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.location.Address;
import android.location.Criteria;
import android.location.Geocoder;
import android.location.LocationListener;
import android.location.LocationManager;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.myjobpitch.R;
import com.myjobpitch.activities.LoginActivity;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.StatusLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class LocationEditFragment extends EditFragment<Location> implements GoogleApiClient.OnConnectionFailedListener {
    public static final int SELECT_LOCATION = 1000;

    private CheckBox mLocationMobilePublicView;
    private EditText mLocationNameView;
    private EditText mLocationDescView;
    private EditText mLocationEmailView;
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
        mLocationEmailView = (EditText) view.findViewById(R.id.location_email);
        mLocationEmailPublicView = (CheckBox) view.findViewById(R.id.location_email_public);
        mLocationTelephoneView = (EditText) view.findViewById(R.id.location_telephone);
        mLocationTelephonePublicView = (CheckBox) view.findViewById(R.id.location_telephone_public);
        mLocationMobileView = (EditText) view.findViewById(R.id.location_mobile);
        mLocationMobilePublicView = (CheckBox) view.findViewById(R.id.location_mobile_public);
        mPlaceView = (TextView) view.findViewById(R.id.location_place);

        mLocationEmailView.setText(LoginActivity.myEmail);

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

        Button autoLocationButton = (Button) view.findViewById(R.id.auto_location);
        autoLocationButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    LocationManager locationManager = (LocationManager)getContext().getSystemService(Context.LOCATION_SERVICE);
                    Criteria criteria = new Criteria();
                    criteria.setAccuracy(Criteria.ACCURACY_LOW);
                    criteria.setPowerRequirement(Criteria.POWER_LOW);
                    locationManager.requestSingleUpdate(criteria, new LocationListener() {
                        @Override
                        public void onLocationChanged(android.location.Location location) {
                            mLatitude = location.getLatitude();
                            mLongitude = location.getLongitude();
                            mPlaceName = "";
                            new RequestTask(mLatitude, mLongitude).execute();
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
                    }, null);
                } catch(Exception e) {
                    e.printStackTrace();
                }
            }
        });

        return view;
    }


    class RequestTask extends AsyncTask<Void, Void, String> {

        Double latitude, longitude;

        public RequestTask(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        @Override
        protected String doInBackground(Void ... params) {
            String responseString = null;
            try {
                Geocoder gcd = new Geocoder(getContext(), Locale.getDefault());
                try {
                    List<Address> addresses = gcd.getFromLocation(latitude, longitude, 1);
                    if ( addresses.size() > 0 ) {
                        Address ad = addresses.get(0);
                        mPlaceName = ad.getLocality();
                        if (ad.getSubLocality() != null) {
                            mPlaceName += " " + ad.getSubLocality();
                        }
                    }
                } catch (Exception e) {

                }

                String uri = "http://maps.googleapis.com/maps/api/geocode/json?latlng="+ latitude.toString() +"," + longitude.toString();
                HttpClient httpclient = new DefaultHttpClient();
                HttpResponse response = httpclient.execute(new HttpGet(uri));
                StatusLine statusLine = response.getStatusLine();
                if(statusLine.getStatusCode() == HttpStatus.SC_OK){
                    ByteArrayOutputStream out = new ByteArrayOutputStream();
                    response.getEntity().writeTo(out);
                    responseString = out.toString();
                    out.close();
                } else{
                    //Closes the connection.
                    response.getEntity().getContent().close();
                    throw new IOException(statusLine.getReasonPhrase());
                }
            } catch (Exception e) {
            }
            return responseString;
        }

        @Override
        protected void onPostExecute(String result) {
            super.onPostExecute(result);

            try {
                JSONObject jObject = new JSONObject(result);
                JSONArray jArray = jObject.getJSONArray("results");
                mPlaceId = ((JSONObject)jArray.get(0)).getString("place_id");
                if (mPlaceName != null) {
                    if (mPlaceId == null || mPlaceId.isEmpty())
                        mPlaceView.setText(mPlaceName);
                    else
                        mPlaceView.setText(mPlaceName + " (from Google)");
                }
            } catch (Exception e) {
            }
        }
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
            //mNoImageMessage = getString(R.string.no_image);
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


    @Override
    public void onConnectionFailed(ConnectionResult result) {

    }

}
