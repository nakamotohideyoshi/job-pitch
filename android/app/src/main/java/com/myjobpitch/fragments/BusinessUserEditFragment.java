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
import com.myjobpitch.api.data.Workplace;
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

    public List<Workplace> workplaces;
    public Integer businessId;
    public Boolean isEditMode = true;
    public List<Integer> selectedWorkplaces;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_user_edit, container, false);
        ButterKnife.bind(this, view);

        locationsView.setText("");

        if (isEditMode) {
            title = "Edit User";
            emailView.setText(businessUser.getEmail());
            emailView.setKeyListener(null);
            emailView.setTextColor(Color.GRAY);
            activeView.setChecked(businessUser.getLocations().size() == 0);
            deleteButton.setVisibility(View.VISIBLE);
            saveButton.setText("Save");

            selectedWorkplaces = businessUser.getLocations();

            if (businessUser.getLocations().size() != 0) {
                String locationTitle = "";
                for (int i = 0; i< workplaces.size(); i++) {
                    if (businessUser.getLocations().indexOf(workplaces.get(i).getId()) > -1) {
                        if (locationTitle == "") {
                            locationTitle = workplaces.get(i).getName();
                        } else {
                            locationTitle = locationTitle + ", " + workplaces.get(i).getName();
                        }
                    }
                }
                locationsView.setText(locationTitle);
                locationsView.setTextColor(Color.BLACK);
            } else {
                locationsView.setTextColor(Color.GRAY);
            }
        } else {
            title = "Create User";
            deleteButton.setVisibility(View.GONE);
            resendButton.setVisibility(View.GONE);
            saveButton.setText("Send Invitation");
            selectedWorkplaces = new ArrayList<Integer>();
        }

        return  view;
    }



    @OnClick(R.id.location_select_button)
    void onWorkplace() {
        if(!activeView.isChecked()) {
            final ArrayList<SelectItem> items = new ArrayList<>();
            for (Workplace location : workplaces) {
                items.add(new SelectItem(location.getName(), selectedWorkplaces.contains(location.getId())));
            }

            new SelectDialog(getApp(), "", items, true, new SelectDialog.Action() {
                @Override
                public void apply(int selectedIndex) {
                    String locationTitle = "";
                    selectedWorkplaces = new ArrayList<Integer>();
                    for (int i = 0; i < workplaces.size(); i++) {
                        if (items.get(i).checked) {
                            selectedWorkplaces.add(workplaces.get(i).getId());
                            if (locationTitle == "") {
                                locationTitle = workplaces.get(i).getName();
                            } else {
                                locationTitle = locationTitle + ", " + workplaces.get(i).getName();
                            }
                        }
                    }
                    locationsView.setText(locationTitle);
                }
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

        new Popup(getContext())
                .setMessage("Delete")
                .addGreenButton("Ok", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        showLoading();
                        new APITask(new APIAction() {
                            @Override
                            public void run() {
                                MJPApi.shared().deleteBusinessUser(businessId, businessUser.getId());
                            }
                        }).addListener(new APITaskListener() {
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
                })
                .addGreyButton("Cancel", new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                    }
                })
                .show();

    }

    @OnClick(R.id.user_resend)
    void resendInvitation() {
        showLoading();

        final BusinessUserForCreation businessUserForCreation = new BusinessUserForCreation();
        businessUserForCreation.setLocations(businessUser.getLocations());
        businessUserForCreation.setEmail(businessUser.getEmail());
        new APITask(new APIAction() {
            @Override
            public void run() {
                MJPApi.shared().reCreateBusinessUser(businessUserForCreation, businessId, businessUser.getId());
            }
        }).addListener(new APITaskListener() {
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

        if (!activeView.isChecked() && selectedWorkplaces.size() < 1) {
            new Popup(getContext())
                    .setMessage("You must select at least one work place.")
                    .addGreenButton("Ok", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            onWorkplace();
                        }
                    })
                    .show();
        } else {
            if (isEditMode) {
                final BusinessUserForUpdate businessUserForUpdate = new BusinessUserForUpdate();
                businessUserForUpdate.setLocations(activeView.isChecked() ? new ArrayList<Integer>() : selectedWorkplaces);
                new APITask(new APIAction() {
                    @Override
                    public void run() {
                        MJPApi.shared().updateBusinessUser(businessUserForUpdate, businessId, businessUser.getId());
                    }
                }).addListener(new APITaskListener() {
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
                businessUserForCreation.setLocations(activeView.isChecked() ? new ArrayList<Integer>() : selectedWorkplaces);
                businessUserForCreation.setEmail(emailView.getText().toString());
                new APITask(new APIAction() {
                    @Override
                    public void run() {
                        MJPApi.shared().createBusinessUser(businessUserForCreation, businessId);
                    }
                }).addListener(new APITaskListener() {
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
