package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
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
    List<String> mContractNames;
    List<String> mHoursNames;
    List<String> mRadiusNames = Arrays.asList(
            "1 mile", "2 miles", "5 miles", "10 miles", "50 miles"
    );
    List<Integer> radiusValues = Arrays.asList(
            1, 2, 5, 10, 50
    );

    Double mLongitude;
    Double mLatitude;
    String mPlaceName;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_profile, container, false);
        ButterKnife.bind(this, view);

        // data
        mContractNames = AppHelper.getNames(AppData.contracts);
        mContractNames.add(0, getString(R.string.any_));
        mContractView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mContractNames));
        mContractView.setText(mContractNames.get(0));

        mHoursNames = AppHelper.getNames(AppData.hours);
        mHoursNames.add(0, getString(R.string.any_));
        mHoursView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mHoursNames));
        mHoursView.setText(mHoursNames.get(0));

        mRadiusView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mRadiusNames));
        mRadiusView.setText(mRadiusNames.get(2));

        // load
        if (AppData.profile != null) {
            load();
        }

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

        JobProfile profile = AppData.profile;

        if (profile.getSectors() != null) {
            List<Sector> selectedSectors = new ArrayList<>();
            for (Integer sectorId : profile.getSectors()) {
                Sector sector = AppData.getObjById(AppData.sectors, sectorId);
                selectedSectors.add(sector);
            }
            updateSelectedSectors(selectedSectors);
        } else {
            updateSelectedSectors(new ArrayList<>());
        }

        if (profile.getContract() != null) {
            mContractView.setText(AppData.getNameById(AppData.contracts, profile.getContract()));
        }

        if (profile.getHours() != null) {
            mHoursView.setText(AppData.getNameById(AppData.hours, profile.getHours()));
        }

        int index = radiusValues.indexOf(profile.getSearch_radius());
        mRadiusView.setText(mRadiusNames.get(index));

        mLongitude = profile.getLongitude();
        mLatitude = profile.getLatitude();
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
        final ArrayList<SelectItem> items = new ArrayList<>();
        for (Sector sector : AppData.sectors) {
            items.add(new SelectItem(
                    sector.getName(),
                    selectedSectors.contains(sector)
            ));
        }

        new SelectDialog(getApp(), getString(R.string.select), items, true, selectedIndex -> {
            selectedSectors.clear();
            for (int i = 0; i < items.size(); i++) {
                if (items.get(i).checked) {
                    selectedSectors.add(AppData.sectors.get(i));
                }
            }
            updateSelectedSectors(selectedSectors);
        });
    }

    @OnClick(R.id.job_profile_address_button)
    void onLocation() {
        Intent intent = new Intent(getApp(), SelectPlaceActivity.class);
        if (mLongitude != null)
            intent.putExtra(SelectPlaceActivity.LONGITUDE, mLongitude);
        if (mLatitude != null)
            intent.putExtra(SelectPlaceActivity.LATITUDE, mLatitude);
        int radiusIndex = mRadiusNames.indexOf(mRadiusView.getText().toString());
        intent.putExtra(SelectPlaceActivity.RADIUS, radiusValues.get(radiusIndex) * 1609.344);
        getApp().startActivityForResult(intent, 1);
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

    @OnClick(R.id.job_profile_save)
    void onSave() {
        if (!valid()) return;

        final JobProfile profile = new JobProfile();
        profile.setId(AppData.jobSeeker.getProfile());
        profile.setJob_seeker(AppData.jobSeeker.getId());

        List<Integer> selectedSectors = new ArrayList<>();
        for (Sector sector : mSelectedSectors)
            selectedSectors.add(sector.getId());
        profile.setSectors(selectedSectors);

        int contractIndex = mContractNames.indexOf(mContractView.getText().toString()) - 1;
        if (contractIndex != -1) {
            profile.setContract(AppData.contracts.get(contractIndex).getId());
        }

        int hoursIndex = mHoursNames.indexOf(mHoursView.getText().toString()) - 1;
        if (hoursIndex != -1) {
            profile.setHours(AppData.hours.get(hoursIndex).getId());
        }

        int radiusIndex = mRadiusNames.indexOf(mRadiusView.getText().toString());
        profile.setSearch_radius(radiusValues.get(radiusIndex));

        profile.setLongitude(mLongitude);
        profile.setLatitude(mLatitude);
        profile.setPlace_name(mPlaceName);
        profile.setPlace_id("");
        profile.setPostcode_lookup("");

        showLoading();

        new APITask(() -> {
            if (profile.getId() == null) {
                AppData.profile = MJPApi.shared().create(JobProfile.class, profile);
            } else {
                AppData.profile = MJPApi.shared().update(JobProfile.class, profile);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                Popup popup = new Popup(getContext(), R.string.success, true);
                popup.addGreenButton(R.string.ok, view -> {
                    if (AppData.jobSeeker.getProfile() == null) {
                        AppData.startTimer();
                        AppData.jobSeeker.setProfile(AppData.profile.getId());
                        if (AppData.jobSeeker.getPitch() == null) {
                            getApp().setRootFragement(R.id.menu_record);
                        } else {
                            getApp().setRootFragement(R.id.menu_find_job);
                        }
                    }
                });
                popup.show();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }
}
