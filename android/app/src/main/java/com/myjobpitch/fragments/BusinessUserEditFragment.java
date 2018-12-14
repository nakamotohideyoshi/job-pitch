package com.myjobpitch.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.BusinessUser;
import com.myjobpitch.api.data.BusinessUserForCreation;
import com.myjobpitch.api.data.BusinessUserForUpdate;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessUserEditFragment extends FormFragment {

    @BindView(R.id.administrator_active)
    CheckBox activeView;

    @BindView(R.id.business_user_email)
    MaterialEditText emailView;

    @BindView(R.id.business_user_locations)
    MaterialEditText locationsView;

    @BindView(R.id.user_delete)
    Button deleteButton;

    @BindView(R.id.user_save)
    Button saveButton;

    @BindView(R.id.user_resend)
    Button resendButton;

    public BusinessUser businessUser;

    public List<Location> locations;
    public Integer businessId;
    public Boolean isEditMode = true;
    public List<Integer> selectedLocations;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_user_edit, container, false);
        ButterKnife.bind(this, view);

        locationsView.setText("");

        if (isEditMode) {
            title = getString(R.string.edit_user);
            emailView.setText(businessUser.getEmail());
            emailView.setKeyListener(null);
            emailView.setTextColor(Color.GRAY);
            activeView.setChecked(businessUser.getLocations().size() == 0);
            deleteButton.setVisibility(View.VISIBLE);
            saveButton.setText(R.string.save);

            selectedLocations = businessUser.getLocations();

            if (businessUser.getLocations().size() != 0) {
                String locationTitle = "";
                for (int i=0; i<locations.size(); i++) {
                    if (businessUser.getLocations().indexOf(locations.get(i).getId()) > -1) {
                        if (locationTitle == "") {
                            locationTitle = locations.get(i).getName();
                        } else {
                            locationTitle = locationTitle + ", " + locations.get(i).getName();
                        }
                    }
                }
                locationsView.setText(locationTitle);
                locationsView.setTextColor(Color.BLACK);
            } else {
                locationsView.setTextColor(Color.GRAY);
            }
        } else {
            title = getString(R.string.add_user);
            deleteButton.setVisibility(View.GONE);
            resendButton.setVisibility(View.GONE);
            saveButton.setText(R.string.send_inviation);
            selectedLocations = new ArrayList<>();
        }

        return  view;
    }



    @OnClick(R.id.location_select_button)
    void onLocation() {
        if(!activeView.isChecked()) {
            final ArrayList<SelectItem> items = new ArrayList<>();
            for (Location location : locations) {
                items.add(new SelectItem(location.getName(), selectedLocations.contains(location.getId())));
            }

            new SelectDialog(getApp(), "", items, true, selectedIndex -> {
                String locationTitle = "";
                selectedLocations = new ArrayList<>();
                for (int i = 0; i < locations.size(); i++) {
                    if (items.get(i).checked) {
                        selectedLocations.add(locations.get(i).getId());
                        if (locationTitle == "") {
                            locationTitle = locations.get(i).getName();
                        } else {
                            locationTitle = locationTitle + ", " + locations.get(i).getName();
                        }
                    }
                }
                locationsView.setText(locationTitle);
            });
        }
    }

    @OnClick(R.id.administrator_active)
    void onActivate() {
       if  (activeView.isChecked()) {
           locationsView.setTextColor(Color.GRAY);
       } else {
           locationsView.setTextColor(Color.BLACK);
       }
    }

    @OnClick(R.id.user_delete)
    void deleteUser() {

        Popup popup = new Popup(getContext(), R.string.delete, true);
        popup.addGreenButton(R.string.ok, view -> {
            showLoading();
            new APITask(() -> MJPApi.shared().deleteBusinessUser(businessId, businessUser.getId())).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    getApp().popFragment();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        });
        popup.addGreyButton(R.string.cancel, v -> {
        });
        popup.show();

    }

    @OnClick(R.id.user_resend)
    void resendInvitation() {
        showLoading();

        final BusinessUserForCreation businessUserForCreation = new BusinessUserForCreation();
        businessUserForCreation.setLocations(businessUser.getLocations());
        businessUserForCreation.setEmail(businessUser.getEmail());
        new APITask(() -> MJPApi.shared().reCreateBusinessUser(businessUserForCreation, businessId, businessUser.getId())).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                getApp().popFragment();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.user_save)
    void saveUser() {
        showLoading();

        if (!activeView.isChecked() && selectedLocations.size() < 1) {
            Popup popup = new Popup(getContext(), R.string.workplace_select_message, true);
            popup.addGreenButton(R.string.ok, view -> onLocation());
            popup.show();
        } else {
            if (isEditMode) {
                final BusinessUserForUpdate businessUserForUpdate = new BusinessUserForUpdate();
                businessUserForUpdate.setLocations(activeView.isChecked() ? new ArrayList<>() : selectedLocations);
                new APITask(() -> MJPApi.shared().updateBusinessUser(businessUserForUpdate, businessId, businessUser.getId())).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {
                        getApp().popFragment();
                    }
                    @Override
                    public void onError(JsonNode errors) {
                        errorHandler(errors);
                    }
                }).execute();
            } else {
                final BusinessUserForCreation businessUserForCreation = new BusinessUserForCreation();
                businessUserForCreation.setLocations(activeView.isChecked() ? new ArrayList<>() : selectedLocations);
                businessUserForCreation.setEmail(emailView.getText().toString());
                new APITask(() -> MJPApi.shared().createBusinessUser(businessUserForCreation, businessId)).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {
                        getApp().popFragment();
                    }
                    @Override
                    public void onError(JsonNode errors) {
                        errorHandler(errors);
                    }
                }).execute();
            }
        }

    }

}
