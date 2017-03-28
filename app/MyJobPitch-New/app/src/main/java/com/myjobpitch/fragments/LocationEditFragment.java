package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteLocationImageTask;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import org.apache.commons.lang3.SerializationUtils;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LocationEditFragment extends BaseFragment {

    @BindView(R.id.location_name)
    MaterialEditText nameView;

    @BindView(R.id.location_desc)
    MaterialEditText descView;

    @BindView(R.id.location_email)
    MaterialEditText emailView;
    @BindView(R.id.location_email_public)
    CheckBox emailPublicView;

    @BindView(R.id.location_phone)
    MaterialEditText phoneView;
    @BindView(R.id.location_phone_public)
    CheckBox phonePublicView;

    @BindView(R.id.location_address)
    MaterialEditText addressView;

    @BindView(R.id.location_logo)
    View logoView;

    ImageSelector imageSelector;

    Double latitude;
    Double longitude;
    String placeID = "";
    String placeName;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_location_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        // title and location info

        Location location = BusinessDetailFragment.selectedLocation;
        if (location == null) {
            title = "Add Work Place";
            emailView.setText(getApp().getEmail());
        } else {
            title = "Edit Work Place";

            nameView.setText(location.getName());
            descView.setText(location.getDescription());
            emailView.setText(location.getEmail());
            emailPublicView.setChecked(location.getEmail_public());
            phoneView.setText(location.getMobile());
            phonePublicView.setChecked(location.getMobile_public());
            addressView.setText(location.getPlace_name());
            placeID = location.getPlace_id();
            placeName = location.getPlace_name();
            latitude = location.getLatitude();
            longitude = location.getLongitude();

            if (location.getImages().size() > 0) {
                imageSelector.loadImage(location.getImages().get(0).getImage());
            } else {
                Business business = location.getBusiness_data();
                if (business.getImages().size() > 0) {
                    imageSelector.setDefaultImage(business.getImages().get(0).getImage());
                }
            }
        }

        // save button

        Menu menu = getApp().getToolbarMenu();
        MenuItem saveItem = menu.add(Menu.NONE, 100, 1, "Save");
        saveItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);

        return  view;
    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"location_name", nameView},
                {"location_description", descView},
                {"location_email", emailView},
                {"location_location", addressView}
        };
    }

    @OnClick(R.id.location_address_button)
    void onSelectLocation() {
        Intent intent = new Intent(getApp(), SelectPlaceActivity.class);
        if (latitude != null) {
            intent.putExtra(SelectPlaceActivity.LATITUDE, latitude);
            intent.putExtra(SelectPlaceActivity.LONGITUDE, longitude);
            intent.putExtra(SelectPlaceActivity.ADDRESS, placeName);
        }
        startActivityForResult(intent, 1);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == ImageSelector.IMAGE_PICK) {
                imageSelector.setImageUri(data.getData());
            } else {
                latitude = data.getDoubleExtra(SelectPlaceActivity.LATITUDE, 0);
                longitude = data.getDoubleExtra(SelectPlaceActivity.LONGITUDE, 0);
                placeName = data.getStringExtra(SelectPlaceActivity.ADDRESS);
                addressView.setText(placeName);
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            if (!valid()) return;
            saveLocation();
        }
    }

    void saveLocation() {
        AppHelper.showLoading("Saving...");

        final Location location;
        if (BusinessDetailFragment.selectedLocation == null) {
            location = new Location();
            location.setBusiness(BusinessListFragment.selectedBusiness.getId());
        } else {
            location = SerializationUtils.clone(BusinessDetailFragment.selectedLocation);
        }

        location.setName(nameView.getText().toString().trim());
        location.setDescription(descView.getText().toString().trim());
        location.setEmail(emailView.getText().toString().trim());
        location.setEmail_public(emailPublicView.isChecked());
        location.setTelephone("");
        location.setTelephone_public(true);
        location.setMobile(phoneView.getText().toString().trim());
        location.setMobile_public(phonePublicView.isChecked());
        location.setPlace_id(placeID);
        location.setPlace_name(placeName);
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setAddress("");
        location.setPostcode_lookup("");

        new AsyncTask<Void, Void, Location>() {
            @Override
            protected Location doInBackground(Void... params) {
                try {
                    if (location.getId() == null) {
                        Location newLocation = MJPApi.shared().createLocation(location);
                        BusinessListFragment.selectedBusiness = MJPApi.shared().get(Business.class, BusinessListFragment.selectedBusiness.getId());
                        BusinessListFragment.requestReloadBusinesses = true;
                        return newLocation;
                    } else {
                        return MJPApi.shared().updateLocation(location);
                    }
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Location data) {
                if (data != null) {
                    BusinessDetailFragment.requestReloadLocations = true;
                    BusinessDetailFragment.selectedLocation = data;
                    saveLogo();
                }
            }
        }.execute();
    }

    void saveLogo() {
        Location location = BusinessDetailFragment.selectedLocation;
        if (imageSelector.getImageUri() != null) {
            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-location-images", "location", imageSelector.getImageUri(), location);
            uploadTask.addListener(new APITaskListener<Boolean>() {
                @Override
                public void onPostExecute(Boolean success) {
                    reloadLocation();
                }
                @Override
                public void onCancelled() {
                }
            });
            uploadTask.execute();
        } else if (location.getImages().size() > 0 && imageSelector.getImage() == null) {
            DeleteLocationImageTask deleteTask = new DeleteLocationImageTask(location.getImages().get(0).getId());
            deleteTask.addListener(new DeleteAPITaskListener() {
                @Override
                public void onSuccess() {
                    reloadLocation();
                }
                @Override
                public void onError(JsonNode errors) {
                    Popup.showGreen("Error deleting image", null, null, "OK", null, true);
                }
                @Override
                public void onConnectionError() {
                    Popup.showGreen("Connection Error: Please check your internet connection", null, null, "OK", null, true);
                }
                @Override
                public void onCancelled() {}
            });
            deleteTask.execute();
        } else {
            AppHelper.hideLoading();
            getApp().popFragment();
        }
    }

    void reloadLocation() {
        new AsyncTask<Void, Void, Location>() {
            @Override
            protected Location doInBackground(Void... params) {
                try {
                    return MJPApi.shared().get(Location.class, BusinessDetailFragment.selectedLocation.getId());
                } catch (MJPApiException e) {
                    Popup.showGreen(e.getMessage(), null, null, "OK", null, true);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Location data) {
                if (data != null) {
                    AppHelper.hideLoading();
                    LocationDetailFragment.requestReloadJobs = true;
                    BusinessDetailFragment.selectedLocation = data;
                    getApp().popFragment();
                }
            }
        }.execute();
    }

}
