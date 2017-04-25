package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteBusinessImageTask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

import static android.content.Context.MODE_PRIVATE;

public class BusinessEditFragment extends FormFragment {

    @BindView(R.id.business_name)
    MaterialEditText nameView;

    @BindView(R.id.business_credits)
    TextView creditsView;

    @BindView(R.id.add_credits_button)
    Button addCreditsButton;

    @BindView(R.id.business_logo)
    View logoView;

    private ImageSelector imageSelector;

    private int businessCount;

    public Business business;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_business_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        businessCount = AppData.user.getBusinesses().size();

        // title and business info

        if (business == null) {
            title = "Add Business";
            creditsView.setText(AppData.initialTokens.getTokens().toString());
            addCreditsButton.setVisibility(View.GONE);
        } else {
            title = "Edit Business";

            view.setVisibility(View.INVISIBLE);
            new APITask("Loading...", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    business = MJPApi.shared().getUserBusiness(business.getId());
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
        nameView.setText(business.getName());
        creditsView.setText(business.getTokens().toString());
        if (business.getImages().size() > 0) {
            imageSelector.loadImage(business.getImages().get(0).getImage());
        }
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("business_name", nameView);
            }
        };
    }

    @OnClick(R.id.add_credits_button)
    void onCredits() {
        PaymentFragment fragment = new PaymentFragment();
        fragment.business = business;
        getApp().pushFragment(fragment);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == ImageSelector.IMAGE_PICK) {
                imageSelector.setImageUri(data.getData());
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            if (valid()) {
                saveBusiness();
            }
        }
    }

    private void saveBusiness() {

        if (business == null) {
            business = new Business();
        }

        business.setName(nameView.getText().toString().trim());

        Loading.show("Saving...");

        new APITask(this) {
            @Override
            protected void runAPI() throws MJPApiException {
                if (business.getId() == null) {
                    business = MJPApi.shared().createBusiness(business);
                    AppData.user = MJPApi.shared().getUser();
                } else {
                    business = MJPApi.shared().updateBusiness(business);
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

            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-business-images", "business", imageSelector.getImageUri(), business);
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

        } else if (business.getImages().size() > 0 && imageSelector.getImage() == null){

            DeleteBusinessImageTask deleteTask = new DeleteBusinessImageTask(business.getImages().get(0).getId());
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
        if (businessCount == 0) {
            getApp().reloadMenu(false);

            BusinessListFragment.firstCreate = true;
            getApp().getSharedPreferences("firstCreate", MODE_PRIVATE).edit()
                    .putBoolean("workplace", true)
                    .commit();
        }
        Loading.hide();
        getApp().popFragment();
    }

}
