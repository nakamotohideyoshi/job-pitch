package com.myjobpitch.fragments;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import com.myjobpitch.SelectPlaceActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class JobProfileFragment extends FormFragment {

    static final int MENU_SAVE = 10;

    @BindView(R.id.job_profile_sectors)
    MaterialEditText mSectorsView;

    @BindView(R.id.job_profile_contract)
    MaterialBetterSpinner mContractView;

    @BindView(R.id.job_profile_hours)
    MaterialBetterSpinner mHoursView;

    @BindView(R.id.job_profile_address)
    MaterialEditText mAddressView;

    @BindView(R.id.job_profile_radius)
    MaterialBetterSpinner mRadiusView;

    List<Sector> mSelectedSectors = new ArrayList<>();
    List<Sector> mSectors = new ArrayList<>();
    List<String> mContractNames = new ArrayList<>();
    List<String> mHoursNames = new ArrayList<>();
    List<String> mRadiusNames = Arrays.asList(
            "1 mile", "2 miles", "5 miles", "10 miles", "50 miles"
    );
    List<Integer> radiusValues = Arrays.asList(
            1, 2, 5, 10, 50
    );

    Double mLongitude;
    Double mLatitude;
    String mPlaceId = "";
    String mPlaceName;

    JobSeeker jobSeeker;
    JobProfile profile;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_profile, container, false);
        ButterKnife.bind(this, view);

        // menu
        addMenuItem("Save", -1);

        // data
        mSectors = AppData.get(Sector.class);

        mContractNames.add("Any");
        for (Contract contract : AppData.get(Contract.class)) {
            mContractNames.add(contract.getName());
        }
        mContractView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mContractNames));
        mContractView.setText(mContractNames.get(0));

        mHoursNames.add("Any");
        for (Hours hours : AppData.get(Hours.class)) {
            mHoursNames.add(hours.getName());
        }
        mHoursView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mHoursNames));
        mHoursView.setText(mHoursNames.get(0));

        mRadiusView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mRadiusNames));
        mRadiusView.setText(mRadiusNames.get(2));

        // load
        view.setVisibility(View.INVISIBLE);
        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                if (jobSeeker.getProfile() != null) {
                    profile = MJPApi.shared().get(JobProfile.class, jobSeeker.getProfile());
                    AppData.existProfile = true;
                }
            }
            @Override
            protected void onSuccess() {
                view.setVisibility(View.VISIBLE);
                if (profile != null) {
                    load();
                }
            }
        };

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("sectors", mSectorsView);
                put("location", mAddressView);
            }
        };
    }

    void load() {

        if (profile.getSectors() != null) {
            List<Sector> selectedSectors = new ArrayList<>();
            for (Integer sectorId : profile.getSectors())
                for (Sector sector : mSectors)
                    if (sector.getId().equals(sectorId))
                        selectedSectors.add(sector);
            updateSelectedSectors(selectedSectors);
        } else {
            updateSelectedSectors(new ArrayList<Sector>());
        }

        if (profile.getContract() != null) {
            mContractView.setText(AppData.get(Contract.class, profile.getContract()).getName());
        }

        if (profile.getHours() != null) {
            mHoursView.setText(AppData.get(Hours.class, profile.getHours()).getName());
        }

        int index = radiusValues.indexOf(profile.getSearch_radius());
        mRadiusView.setText(mRadiusNames.get(index));

        mLongitude = profile.getLongitude();
        mLatitude = profile.getLatitude();
        mPlaceId = profile.getPlace_id();
        mPlaceName = profile.getPlace_name();

        if (mPlaceName != null) {
            mAddressView.setText(mPlaceName);
        }

    }

    void updateSelectedSectors(List<Sector> selectedSectors) {
        mSelectedSectors = selectedSectors;
        if (selectedSectors.isEmpty())
            mSectorsView.setText("");
        else {
            StringBuilder text = new StringBuilder();
            for (Sector sector : mSelectedSectors) {
                if (text.length() > 0)
                    text.append(", ");
                text.append(sector.getName());
            }
            mSectorsView.setText(text);
        }
    }

    @OnClick(R.id.job_profile_sectors_button)
    void onSectors() {
        final List<Sector> selectedSectors = new ArrayList<>(mSelectedSectors);
        String[] sectorNames = new String[mSectors.size()];
        boolean[] checkedSectors = new boolean[mSectors.size()];
        for (int i = 0; i < mSectors.size(); i++) {
            Sector sector = mSectors.get(i);
            sectorNames[i] = sector.getName();
            checkedSectors[i] = selectedSectors.contains(sector);
        }
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("Select job sectors")
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
                .setPositiveButton("OK", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialog, int id) {
                        updateSelectedSectors(selectedSectors);
                    }
                })
                .setNegativeButton("CANCEL", null)
                .show();
    }

    @OnClick(R.id.job_profile_address_button)
    void onLocation() {
        Intent intent = new Intent(getApp(), SelectPlaceActivity.class);
        if (mLongitude != null)
            intent.putExtra(SelectPlaceActivity.LONGITUDE, mLongitude);
        if (mLatitude != null)
            intent.putExtra(SelectPlaceActivity.LATITUDE, mLatitude);
        startActivityForResult(intent, 10000);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            mLatitude = data.getDoubleExtra(SelectPlaceActivity.LATITUDE, 0);
            mLongitude = data.getDoubleExtra(SelectPlaceActivity.LONGITUDE, 0);
            mPlaceName = data.getStringExtra(SelectPlaceActivity.ADDRESS);
            mAddressView.setText(mPlaceName);
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == MENU_SAVE) {
            if (!valid()) return;

            if (profile == null) {
                profile = new JobProfile();
                profile.setJob_seeker(jobSeeker.getId());
            }

            List<Integer> selectedSectors = new ArrayList<>();
            for (Sector sector : mSelectedSectors)
                selectedSectors.add(sector.getId());
            profile.setSectors(selectedSectors);

            int contractIndex = mContractNames.indexOf(mContractView.getText().toString()) - 1;
            if (contractIndex != -1) {
                profile.setContract(AppData.get(Sex.class).get(contractIndex).getId());
            }

            int hoursIndex = mHoursNames.indexOf(mHoursView.getText().toString()) - 1;
            if (hoursIndex != -1) {
                profile.setHours(AppData.get(Hours.class).get(hoursIndex).getId());
            }

            int radiusIndex = mRadiusNames.indexOf(mRadiusView.getText().toString());
            profile.setSearch_radius(radiusValues.get(radiusIndex));

            profile.setPlace_name(mPlaceName);
            profile.setPlace_id(mPlaceId);
            profile.setLongitude(mLongitude);
            profile.setLatitude(mLatitude);
            profile.setPostcode_lookup("");

            new APITask("Saving...", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    if (profile.getId() == null) {
                        profile = MJPApi.shared().create(JobProfile.class, profile);
                    } else {
                        profile = MJPApi.shared().update(JobProfile.class, profile);
                    }
                }
                @Override
                protected void onSuccess() {
                    Popup.showGreen("Success!", "OK", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            if (!AppData.existProfile) {
                                getApp().reloadMenu();
                                if (jobSeeker.getPitch() == null) {
                                    getApp().setRootFragement(AppData.PAGE_ADD_RECORD);
                                } else {
                                    getApp().setRootFragement(AppData.PAGE_FIND_JOB);
                                }
                                AppData.existProfile = true;
                            }
                        }
                    }, null, null, true);
                }
            };

        }
    }

}
