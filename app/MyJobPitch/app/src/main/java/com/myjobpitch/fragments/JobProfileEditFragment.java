package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.Spinner;
import android.widget.TextView;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.widgets.MJPObjectWithNameAdapter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobProfileEditFragment extends EditFragment {
    public static final int SELECT_PLACE = 1;
    public static final int DEFAULT_RADIUS_INDEX = 2;

    private Spinner mProfileSectorsView;
    private Spinner mProfileContractView;
    private Spinner mProfileHoursView;
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;
    private Spinner mRadiusSpinner;
    private TextView mPlaceView;
    private ImageButton mPlaceButton;

    private Double mLongitude;
    private Double mLatitude;
    private String mPlaceId = "";
    private String mPlaceName;
    private List<String> radiusOptions = Arrays.asList(new String[] {
        "1 mile", "2 miles", "5 miles", "10 miles", "50 miles"
    });
    private List<Integer> radiusValues = Arrays.asList(new Integer[] {
        1, DEFAULT_RADIUS_INDEX, 5, 10, 50
    });

    public static JobProfileEditFragment newInstance() {
        JobProfileEditFragment fragment = new JobProfileEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public JobProfileEditFragment() {
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
        View view = inflater.inflate(R.layout.fragment_job_profile_edit, container, false);

        mProfileSectorsView = (Spinner) view.findViewById(R.id.job_profile_sectors);
        mProfileContractView = (Spinner) view.findViewById(R.id.job_profile_contract);
        mProfileHoursView = (Spinner) view.findViewById(R.id.job_profile_hours);


        mPlaceView = (TextView) view.findViewById(R.id.place);

        mPlaceButton = (ImageButton) view.findViewById(R.id.place_button);
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
                startActivityForResult(intent, SELECT_PLACE);
            }
        });

        mRadiusSpinner = (Spinner) view.findViewById(R.id.select_radius);
        ArrayAdapter<String> adapter = new ArrayAdapter<String>(getActivity(), android.R.layout.simple_spinner_dropdown_item, radiusOptions);
        mRadiusSpinner.setAdapter(adapter);
        mRadiusSpinner.setSelection(DEFAULT_RADIUS_INDEX);

        Map<String, View> fields = new HashMap<>();
        fields.put("sectors", mProfileSectorsView);
        fields.put("contract", mProfileContractView);
        fields.put("hours", mProfileHoursView);
        fields.put("radius", mRadiusSpinner);
        setFields(fields);

        setRequiredFields(fields.values());

        return view;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sectors = application.get(Sector.class);
        mProfileSectorsView.setAdapter(new MJPObjectWithNameAdapter(this.getActivity(), android.R.layout.simple_list_item_1, this.sectors));

        this.contracts = new ArrayList<>();
        Contract anyContract = new Contract();
        anyContract.setName(getString(R.string.any));
        this.contracts.add(anyContract);
        this.contracts.addAll(application.get(Contract.class));
        mProfileContractView.setAdapter(new MJPObjectWithNameAdapter<Contract>(this.getActivity(), android.R.layout.simple_list_item_1, this.contracts));

        this.hours = new ArrayList<>();
        Hours anyHours = new Hours();
        anyHours.setName(getString(R.string.any));
        this.hours.add(anyHours);
        this.hours.addAll(application.get(Hours.class));
        mProfileHoursView.setAdapter(new MJPObjectWithNameAdapter<Hours>(this.getActivity(), android.R.layout.simple_list_item_1, this.hours));
    }

    public void load(JobProfile jobProfile) {
        List<Integer> selectedSectors = jobProfile.getSectors();
        if (jobProfile.getSectors() != null && !selectedSectors.isEmpty()) {
            Integer selectedSector = selectedSectors.get(0);
            for (int i = 0; i < sectors.size(); i++) {
                if (this.sectors.get(i).getId() == selectedSector) {
                    mProfileSectorsView.setSelection(i);
                    break;
                }
            }
        }

        Integer selectedContract = jobProfile.getContract();
        for (int i = 0; i < contracts.size(); i++) {
            if (contracts.get(i).getId() == selectedContract) {
                mProfileContractView.setSelection(i);
                break;
            }
        }

        Integer selectedHours = jobProfile.getHours();
        for (int i = 0; i < this.hours.size(); i++) {
            if (this.hours.get(i).getId() == selectedHours) {
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

    public void save(JobProfile jobProfile) {
        MJPAPIObject selectedSector = (MJPAPIObject) mProfileSectorsView.getSelectedItem();

        if (selectedSector != null)
            jobProfile.setSectors(Arrays.asList(new Integer[]{selectedSector.getId()}));
        else
            jobProfile.setSectors(null);

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

        return success;
    }
}
