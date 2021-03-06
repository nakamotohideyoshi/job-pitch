package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.activities.SelectPlaceActivity;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.views.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.io.File;
import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

import static android.content.Context.MODE_PRIVATE;

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

    @BindView(R.id.location_street)
    MaterialEditText streetView;
    @BindView(R.id.location_city)
    MaterialEditText cityView;
    @BindView(R.id.location_region)
    MaterialEditText regionView;
    @BindView(R.id.location_postcode)
    MaterialEditText postcodeView;
    @BindView(R.id.location_country)
    MaterialEditText countryView;

    @BindView(R.id.location_logo)
    View logoView;

    private ImageSelector imageSelector;

    private Double latitude;
    private Double longitude;
    private String placeName;

    private boolean isFirstCreate;
    private boolean isNew = false;

    public Business business;
    public Location location;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_location_edit, container, false);
        ButterKnife.bind(this, view);

        isFirstCreate = getApp().getSharedPreferences("firstCreate", MODE_PRIVATE)
                .getBoolean("workplace", true);

        // title and location info

        if (location == null) {
            title = getString(R.string.add_workplace);
            isNew = true;
        } else {
            title = getString(R.string.edit_workplace);
            business = location.getBusiness_data();
        }

        showLoading(view);
        new APITask(() -> {
            if (location != null) {
                location = MJPApi.shared().getUserLocation(location.getId());
            } else if (isFirstCreate) {
                isFirstCreate = MJPApi.shared().getUserLocations(null).size() == 0;
                if (!isFirstCreate) {
                    getApp().getSharedPreferences("firstCreate", MODE_PRIVATE).edit()
                            .putBoolean("workplace", false)
                            .apply();
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                load();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

        return view;
    }

    private void load() {

        if (business.getImages().size() > 0) {
            imageSelector = new ImageSelector(logoView, business.getImages().get(0).getImage());
        } else {
            imageSelector = new ImageSelector(logoView, R.drawable.default_logo);
        }

        if (location != null) {
            nameView.setText(location.getName());
            descView.setText(location.getDescription());
            emailView.setText(location.getEmail());
            emailPublicView.setChecked(location.getEmail_public());
            phoneView.setText(location.getMobile());
            phonePublicView.setChecked(location.getMobile_public());
            latitude = location.getLatitude();
            longitude = location.getLongitude();
            placeName = location.getPlace_name();
            streetView.setText(location.getStreet());
            cityView.setText(location.getCity());
            regionView.setText(location.getRegion());
            postcodeView.setText(location.getPostcode());
            countryView.setText(location.getCountry());

            if (location.getImages().size() > 0) {
                imageSelector.loadImage(location.getImages().get(0).getImage());
            } else {
                imageSelector.loadImage(null);
            }
        } else {
            emailView.setText(AppData.getEmail());
            imageSelector.loadImage(null);
        }
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("name", nameView);
                put("description", descView);
                put("email", emailView);
                put("street", streetView);
                put("city", cityView);
            }
        };
    }

    @OnClick(R.id.location_email_help)
    void onEmailHelp() {
        Popup popup = new Popup(getContext(), R.string.email_help, true);
        popup.addGreyButton(R.string.close, null);
        popup.show();
    }

    @OnClick(R.id.address_help)
    void onAddressHelp() {
        Popup popup = new Popup(getContext(), R.string.address_help, true);
        popup.addGreyButton(R.string.close, null);
        popup.show();
    }

    @OnClick(R.id.location_address_button)
    void onSelectLocation() {
        Intent intent = new Intent(getApp(), SelectPlaceActivity.class);
        if (latitude != null) {
            intent.putExtra(SelectPlaceActivity.LATITUDE, latitude);
            intent.putExtra(SelectPlaceActivity.LONGITUDE, longitude);
        }
        getActivity().startActivityForResult(intent, 1);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == AppData.REQUEST_IMAGE_CAPTURE) {
                Bitmap photo = (Bitmap) data.getExtras().get("data");
                File file = AppHelper.saveBitmap(photo);
                imageSelector.setImageUri(Uri.fromFile(file));
            } else if (requestCode == AppData.REQUEST_IMAGE_PICK) {
                imageSelector.setImageUri(data.getData());
            } else if (requestCode == AppData.REQUEST_GOOGLE_DRIVE || requestCode == AppData.REQUEST_DROPBOX) {
                String path = (String) data.getExtras().get("path");
                imageSelector.setImageUri(Uri.fromFile(new File(path)));
            } else {
                latitude = data.getDoubleExtra(SelectPlaceActivity.LATITUDE, 0);
                longitude = data.getDoubleExtra(SelectPlaceActivity.LONGITUDE, 0);
                countryView.setText(data.getStringExtra(SelectPlaceActivity.COUNTRY));
                regionView.setText(data.getStringExtra(SelectPlaceActivity.REGION));
                cityView.setText(data.getStringExtra(SelectPlaceActivity.CITY));
                streetView.setText(data.getStringExtra(SelectPlaceActivity.STREET));
                postcodeView.setText(data.getStringExtra(SelectPlaceActivity.POSTCODE));
                placeName = data.getStringExtra(SelectPlaceActivity.ADDRESS);
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            saveLocation();
        }
    }

    @OnClick(R.id.location_save)
    void saveLocation() {

        if (!valid()) return;

        if (location == null) {
            location = new Location();
            location.setBusiness(business.getId());
        }

        location.setName(nameView.getText().toString().trim());
        location.setDescription(descView.getText().toString().trim());
        location.setEmail(emailView.getText().toString().trim());
        location.setEmail_public(emailPublicView.isChecked());
        location.setTelephone("");
        location.setTelephone_public(false);
        location.setMobile(phoneView.getText().toString().trim());
        location.setMobile_public(phonePublicView.isChecked());
        location.setLatitude(latitude);
        location.setLongitude(longitude);
        location.setPlace_name(placeName);
        location.setPlace_id("");
        location.setCountry(countryView.getText().toString().isEmpty() ? "" : countryView.getText().toString());
        location.setRegion(countryView.getText().toString().isEmpty() ? "" : countryView.getText().toString());
        location.setCity(cityView.getText().toString());
        location.setStreet(streetView.getText().toString());
        location.setStreet_number(streetView.getText().toString());
        location.setPostcode(postcodeView.getText().toString());

        showLoading();

        new APITask(() -> {
            if (location.getId() == null) {
                location = MJPApi.shared().createLocation(location);
            } else {
                location = MJPApi.shared().updateLocation(location);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                saveLogo();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    private void saveLogo() {

        if (imageSelector.getImageUri() != null) {

            new UploadImageTask(getApp(), "user-location-images", "location", imageSelector.getImageUri(), location)
            .addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    compltedSave();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();

        } else if (location.getImages().size() > 0 && imageSelector.getImage() == null) {

            new APITask(() -> MJPApi.shared().deleteLocationImage(location.getImages().get(0).getId())).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    compltedSave();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();

        } else {
            compltedSave();
        }
    }

    private void compltedSave() {
        if (!isNew) {
            getApp().popFragment();
            return;
        }

        if (isFirstCreate) {
            getApp().getSharedPreferences("firstCreate", MODE_PRIVATE).edit()
                    .putBoolean("workplace", false)
                    .apply();
        }

        getApp().getSupportFragmentManager().popBackStackImmediate();

        if (getApp().getCurrentMenuID() != R.id.menu_business) {
            JobEditFragment fragment = new JobEditFragment();
            fragment.location = location;
            getApp().pushFragment(fragment);
        } else {
            LocationDetailFragment fragment = new LocationDetailFragment();
            fragment.isFirstCreate = isFirstCreate;
            fragment.location = location;
            getApp().pushFragment(fragment);
        }
    }

}
