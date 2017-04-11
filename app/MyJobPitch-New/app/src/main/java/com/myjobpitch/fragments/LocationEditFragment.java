package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteLocationImageTask;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LocationEditFragment extends FormFragment {

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

    private ImageSelector imageSelector;

    private Double latitude;
    private Double longitude;
    private String placeID = "";
    private String placeName;

    public Business business;
    public Location location;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_location_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        // title and location info

        if (location == null) {
            title = "Add Work Place";
            emailView.setText(getApp().getEmail());
        } else {
            title = "Edit Work Place";

            view.setVisibility(View.INVISIBLE);
            new APITask("Loading...", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    location = MJPApi.shared().getUserLocation(location.getId());
                }
                @Override
                protected void onSuccess() {
                    view.setVisibility(View.VISIBLE);
                    load();
                }
            };
        }

        // save button
        addMenuItem("Save", -1);

        return  view;
    }

    private void load() {
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

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("location_name", nameView);
                put("location_description", descView);
                put("location_email", emailView);
                put("location_location", addressView);
            }
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
            if (valid()) {
                saveLocation();
            }
        }
    }

    private void saveLocation() {

        if (location == null) {
            location = new Location();
            location.setBusiness(business.getId());
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

        Loading.show("Saving...");

        new APITask(this) {
            @Override
            protected void runAPI() throws MJPApiException {
                if (location.getId() == null) {
                    location = MJPApi.shared().createLocation(location);
                } else {
                    location = MJPApi.shared().updateLocation(location);
                }
            }
            @Override
            protected void onSuccess() {
                saveLogo();
            }
        };

    }

    private void saveLogo() {

        if (imageSelector.getImageUri() != null) {

            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-location-images", "location", imageSelector.getImageUri(), location);
            uploadTask.addListener(new APITaskListener<Boolean>() {
                @Override
                public void onPostExecute(Boolean success) {
                    compltedSave();
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
                    compltedSave();
                }
                @Override
                public void onError(JsonNode errors) {
                    Popup.showError("Error deleting image");
                }
                @Override
                public void onConnectionError() {
                    Popup.showError("Connection Error: Please check your internet connection");
                }
                @Override
                public void onCancelled() {}
            });
            deleteTask.execute();

        } else {

            compltedSave();

        }
    }

    private void compltedSave() {
        Loading.hide();
        getApp().popFragment();
    }

}
