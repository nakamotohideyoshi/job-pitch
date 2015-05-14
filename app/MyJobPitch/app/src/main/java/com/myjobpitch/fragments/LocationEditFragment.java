package com.myjobpitch.fragments;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.recruiter.CreateUpdateLocationTask;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

public class LocationEditFragment extends EditFragment<Location> {
    public static final int SELECT_LOCATION = 1;

    private CheckBox mLocationMobilePublicView;
    private EditText mLocationNameView;
    private EditText mLocationDescView;
    private EditText mLocationEmailView;
    private EditText mLocationAddressView;
    private CheckBox mLocationEmailPublicView;
    private EditText mLocationTelephoneView;
    private CheckBox mLocationTelephonePublicView;
    private EditText mLocationMobileView;
    private ImageButton mPlaceButton;
    private TextView mPlaceView;
    private Double mLongitude;
    private Double mLatitude;
    private String mPlaceId = "";
    private String mPlaceName;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static LocationEditFragment newInstance() {
        LocationEditFragment fragment = new LocationEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public LocationEditFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
//            mParam1 = getArguments().getString(ARG_PARAM1);
//            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_location_edit, container, false);

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

        mPlaceButton = (ImageButton) view.findViewById(R.id.location_place_button);
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
        setRequiredFields(requiredFields);

        return view;
    }

    public void load(Location location) {
        mLocationNameView.setText(location.getName());
        mLocationDescView.setText(location.getDescription());
        mLocationAddressView.setText(location.getAddress());
        mLocationEmailView.setText(location.getEmail());
        mLocationEmailPublicView.setChecked(location.getEmail_public());
        mLocationTelephoneView.setText(location.getTelephone());
        mLocationTelephonePublicView.setChecked(location.getTelephone_public());
        mLocationMobileView.setText(location.getMobile());
        mLocationMobilePublicView.setChecked(location.getMobile_public());
        mPlaceName = location.getPlace_name();
        mPlaceId = location.getPlace_id();
        mLongitude = location.getLongitude();
        mLatitude = location.getLatitude();

        if (mPlaceName != null) {
            if (mPlaceId == null || mPlaceId.isEmpty())
                mPlaceView.setText(mPlaceName);
            else
                mPlaceView.setText(mPlaceName + " (from Google)");
        }
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
    }

    public void setEmail(String email) {
        ((TextView) getView().findViewById(R.id.location_email)).setText(email);
    }

    public CreateUpdateLocationTask getCreateLocationTask(MJPApi api, Location location) {
        CreateUpdateLocationTask task = new CreateUpdateLocationTask(api, location);
        task.addListener(this);
        return task;
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
