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
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.TextView;

import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.widgets.MJPObjectWithNameAdapter;

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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class JobProfileEditFragment extends EditFragment implements GoogleApiClient.OnConnectionFailedListener {
    public static final int SELECT_PLACE = 1;
    public static final int DEFAULT_RADIUS_INDEX = 2;

    private TextView mProfileSectorsView;
    private Spinner mProfileContractView;
    private Spinner mProfileHoursView;

    private List<Sector> mSelectedSectors = new ArrayList<>();
    private List<Sector> mSectors;
    private List<Contract> mContracts;
    private List<Hours> mHours;

    private Spinner mRadiusSpinner;
    private TextView mPlaceView;
    private Double mLongitude;
    private Double mLatitude;
    private String mPlaceId = "";
    private String mPlaceName;
    private List<String> radiusOptions = Arrays.asList(
        "1 mile", "2 miles", "5 miles", "10 miles", "50 miles"
    );
    private List<Integer> radiusValues = Arrays.asList(
        1, 2, 5, 10, 50
    );

    public JobProfileEditFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_job_profile_edit, container, false);

        mProfileContractView = (Spinner) view.findViewById(R.id.job_profile_contract);
        mProfileHoursView = (Spinner) view.findViewById(R.id.job_profile_hours);

        mProfileSectorsView = (TextView) view.findViewById(R.id.job_profile_sectors);
        Button profileSectorsButton = (Button) view.findViewById(R.id.job_profile_sectors_button);
        profileSectorsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                final List<Sector> selectedSectors = new ArrayList<>(mSelectedSectors);
                String[] sectorNames = new String[mSectors.size()];
                boolean[] checkedSectors = new boolean[mSectors.size()];
                for (int i = 0; i < mSectors.size(); i++) {
                    Sector sector = mSectors.get(i);
                    sectorNames[i] = sector.getName();
                    checkedSectors[i] = selectedSectors.contains(sector);
                }
                AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
                builder.setTitle(R.string.select_sectors)
                        .setMultiChoiceItems(sectorNames, checkedSectors,
                                new DialogInterface.OnMultiChoiceClickListener() {
                                    @Override
                                    public void onClick(DialogInterface dialog, int i, boolean isChecked) {
                                        Sector sector = mSectors.get(i);
                                        if (isChecked)
                                            selectedSectors.add(sector);
                                        else if (selectedSectors.contains(sector))
                                            selectedSectors.remove(sector);
                                    }
                                })
                        .setPositiveButton(R.string.ok, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int id) {
                                updateSelectedSectors(selectedSectors);
                            }
                        })
                        .setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
                            @Override
                            public void onClick(DialogInterface dialog, int id) {

                            }
                        })
                        .show();
            }
        });

        mPlaceView = (TextView) view.findViewById(R.id.place);

        View placeButton = view.findViewById(R.id.place_button);
        placeButton.setOnClickListener(new View.OnClickListener() {
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
                startActivityForResult(intent, SELECT_PLACE);
            }
        });

        mRadiusSpinner = (Spinner) view.findViewById(R.id.select_radius);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(), android.R.layout.simple_spinner_dropdown_item, radiusOptions);
        mRadiusSpinner.setAdapter(adapter);
        mRadiusSpinner.setSelection(DEFAULT_RADIUS_INDEX);

        Map<String, View> fields = new HashMap<>();
        fields.put("sectors", mProfileSectorsView);
        fields.put("contract", mProfileContractView);
        fields.put("hours", mProfileHoursView);
        fields.put("radius", mRadiusSpinner);
        setFields(fields);

        setRequiredFields(fields.values());

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

    class RequestTask extends AsyncTask<Void, Void, String>{

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

    public void loadApplicationData(MJPApplication application) {
        this.mSectors = application.get(Sector.class);

        this.mContracts = new ArrayList<>();
        Contract anyContract = new Contract();
        anyContract.setName(getString(R.string.any));
        this.mContracts.add(anyContract);
        this.mContracts.addAll(application.get(Contract.class));
        mProfileContractView.setAdapter(new MJPObjectWithNameAdapter<>(this.getActivity(), android.R.layout.simple_list_item_1, this.mContracts));

        this.mHours = new ArrayList<>();
        Hours anyHours = new Hours();
        anyHours.setName(getString(R.string.any));
        this.mHours.add(anyHours);
        this.mHours.addAll(application.get(Hours.class));
        mProfileHoursView.setAdapter(new MJPObjectWithNameAdapter<>(this.getActivity(), android.R.layout.simple_list_item_1, this.mHours));
    }

    public void load(JobProfile jobProfile) {

        if (jobProfile.getSectors() != null) {
            List<Sector> selectedSectors = new ArrayList<>();
            for (Integer sectorId : jobProfile.getSectors())
                for (Sector sector : mSectors)
                    if (sector.getId().equals(sectorId))
                        selectedSectors.add(sector);
            updateSelectedSectors(selectedSectors);
        } else
            updateSelectedSectors(new ArrayList<Sector>());

        Integer selectedContract = jobProfile.getContract();
        for (int i = 0; i < mContracts.size(); i++) {
            Integer contract = mContracts.get(i).getId();
            if ((contract == null && selectedContract == null) || (contract != null && contract.equals(selectedContract))) {
                mProfileContractView.setSelection(i);
                break;
            }
        }

        Integer selectedHours = jobProfile.getHours();
        for (int i = 0; i < this.mHours.size(); i++) {
            Integer hours = mHours.get(i).getId();
            if ((hours == null && selectedHours == null) || (hours != null && hours.equals(selectedHours))) {
                mProfileHoursView.setSelection(i);
                break;
            }
        }

        Integer searchRadius = jobProfile.getSearch_radius();
        int index = radiusValues.indexOf(searchRadius);
        if (index == -1)
            index = DEFAULT_RADIUS_INDEX;
        mRadiusSpinner.setSelection(index);

        mPlaceName = jobProfile.getPlace_name();
        mPlaceId = jobProfile.getPlace_id();
        mLongitude = jobProfile.getLongitude();
        mLatitude = jobProfile.getLatitude();

        if (mPlaceName != null) {
            if (mPlaceId == null || mPlaceId.isEmpty())
                mPlaceView.setText(mPlaceName);
            else
                mPlaceView.setText(mPlaceName + " (from Google)");
        }
    }

    private void updateSelectedSectors(List<Sector> selectedSectors) {
        mSelectedSectors = selectedSectors;
        if (selectedSectors.isEmpty())
            mProfileSectorsView.setText(getString(R.string.not_set));
        else {
            StringBuilder text = new StringBuilder();
            for (Sector sector : mSelectedSectors) {
                if (text.length() > 0)
                    text.append(", ");
                text.append(sector.getName());
            }
            mProfileSectorsView.setText(text);
        }
    }

    public void save(JobProfile jobProfile) {
        List<Integer> selectedSectors = new ArrayList<>();
        for (Sector sector : mSelectedSectors)
            selectedSectors.add(sector.getId());
        jobProfile.setSectors(selectedSectors);

        MJPAPIObject selectedContract = (MJPAPIObject) mProfileContractView.getSelectedItem();
        if (selectedContract != null)
            jobProfile.setContract(selectedContract.getId());
        else
            jobProfile.setContract(null);

        MJPAPIObject selectedHours = (MJPAPIObject) mProfileHoursView.getSelectedItem();
        if (selectedHours != null)
            jobProfile.setHours(selectedHours.getId());
        else
            jobProfile.setHours(null);

        jobProfile.setPlace_name(mPlaceName);
        jobProfile.setPlace_id(mPlaceId);
        jobProfile.setLongitude(mLongitude);
        jobProfile.setLatitude(mLatitude);
        jobProfile.setSearch_radius(radiusValues.get(mRadiusSpinner.getSelectedItemPosition()));
        jobProfile.setPostcode_lookup(""); // Not available in android places API (9.0.0)
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == SELECT_PLACE) {
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

        mProfileSectorsView.setError(null);
        if (mSelectedSectors.isEmpty()) {
            success = false;
            mProfileSectorsView.setError(getString(R.string.error_field_required));
        }

        return success;
    }

    @Override
    public void onConnectionFailed(ConnectionResult result) {

    }
}
