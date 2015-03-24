package com.myjobpitch;

import android.os.Bundle;
import android.app.Fragment;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.myjobpitch.api.data.Location;

import java.util.ArrayList;
import java.util.List;


/**
 * A simple {@link Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link com.myjobpitch.LocationEditFragment.LocationEditHost} interface
 * to handle interaction events.
 * Use the {@link LocationEditFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class LocationEditFragment extends Fragment {
    private CheckBox mLocationMobilePublicView;
    private EditText mLocationNameView;
    private EditText mLocationDescView;
    private EditText mLocationEmailView;
    private CheckBox mLocationEmailPublicView;
    private EditText mLocationTelephoneView;
    private CheckBox mLocationTelephonePublicView;
    private EditText mLocationMobileView;
    private List<TextView> requiredFields;
    private List<TextView> fields;

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
        mLocationEmailView = (EditText) view.findViewById(R.id.location_email);
        mLocationEmailPublicView = (CheckBox) view.findViewById(R.id.location_email_public);
        mLocationTelephoneView = (EditText) view.findViewById(R.id.location_telephone);
        mLocationTelephonePublicView = (CheckBox) view.findViewById(R.id.location_telephone_public);
        mLocationMobileView = (EditText) view.findViewById(R.id.location_mobile);
        mLocationMobilePublicView = (CheckBox) view.findViewById(R.id.location_mobile_public);

        requiredFields = new ArrayList<>();
        requiredFields.add(mLocationNameView);
        requiredFields.add(mLocationDescView);

        fields = new ArrayList<>(requiredFields);
        fields.add(mLocationEmailView);
        fields.add(mLocationTelephoneView);
        fields.add(mLocationMobileView);

        return view;
    }

    public boolean validateInput() {
        for (TextView field : fields)
            field.setError(null);

        View errorField = null;
        for (TextView field : requiredFields) {
            if (TextUtils.isEmpty(field.getText())) {
                field.setError(getString(R.string.error_field_required));
                if (errorField == null)
                    errorField = field;
            }
        }

        if (errorField != null) {
            errorField.requestFocus();
            return false;
        }
        return true;
    }

    public void load(Location location) {
        mLocationNameView.setText(location.getName());
        mLocationDescView.setText(location.getDescription());
        mLocationEmailView.setText(location.getEmail());
        mLocationEmailPublicView.setChecked(location.getEmail_public());
        mLocationTelephoneView.setText(location.getTelephone());
        mLocationTelephonePublicView.setChecked(location.getTelephone_public());
        mLocationMobileView.setText(location.getMobile());
        mLocationMobilePublicView.setChecked(location.getMobile_public());
    }

    public void save(Location location) {
        location.setName(mLocationNameView.getText().toString());
        location.setDescription(mLocationDescView.getText().toString());
        location.setEmail(mLocationEmailView.getText().toString());
        location.setEmail_public(mLocationEmailPublicView.isChecked());
        location.setTelephone(mLocationTelephoneView.getText().toString());
        location.setTelephone_public(mLocationTelephonePublicView.isChecked());
        location.setMobile(mLocationMobileView.getText().toString());
        location.setMobil_public(mLocationMobilePublicView.isChecked());
    }

    public interface LocationEditHost {

    }

}
