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

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteBusinessImageTask;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;

import org.apache.commons.lang3.SerializationUtils;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessEditFragment extends BaseFragment {

    @BindView(R.id.business_name)
    MaterialEditText nameView;

    @BindView(R.id.business_credits)
    MaterialEditText creditsView;

    @BindView(R.id.business_logo)
    View logoView;

    ImageSelector imageSelector;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        // title and business info

        Business business = BusinessListFragment.selectedBusiness;

        if (business == null) {
            title = "Add Business";
        } else {
            title = "Edit Business";

            nameView.setText(business.getName());
            creditsView.setText(business.getTokens().toString());
            if (business.getImages().size() > 0) {
                imageSelector.loadImage(business.getImages().get(0).getImage());
            }
        }

        // save button

        Menu menu = getApp().getToolbarMenu();
        MenuItem saveItem = menu.add(Menu.NONE, 100, 1, "Save");
        saveItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);

        return  view;
    }

    @OnClick(R.id.business_credits_button)
    void onCredits() {

    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"business_name", nameView}
        };
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
            if (!valid()) return;
            saveBusiness();
        }
    }

    void saveBusiness() {
        AppHelper.showLoading("Saving...");

        final Business business;
        if (BusinessListFragment.selectedBusiness == null) {
            business = new Business();
        } else {
            business = SerializationUtils.clone(BusinessListFragment.selectedBusiness);
        }

        business.setName(nameView.getText().toString().trim());

        new AsyncTask<Void, Void, Business>() {
            @Override
            protected Business doInBackground(Void... params) {
                try {
                    if (business.getId() == null) {
                        return MJPApi.shared().createBusiness(business);
                    } else {
                        return MJPApi.shared().updateBusiness(business);
                    }
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Business data) {
                if (data != null) {
                    BusinessListFragment.requestReloadBusinesses = true;
                    BusinessListFragment.selectedBusiness = data;
                    saveLogo();
                }
            }
        }.execute();
    }

    void saveLogo() {
        Business business = BusinessListFragment.selectedBusiness;
        if (imageSelector.getImageUri() != null) {
            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-business-images", "business", imageSelector.getImageUri(), business);
            uploadTask.addListener(new APITaskListener<Boolean>() {
                @Override
                public void onPostExecute(Boolean success) {
                    reloadBusiness();
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
                    reloadBusiness();
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

    void reloadBusiness() {
        new AsyncTask<Void, Void, Business>() {
            @Override
            protected Business doInBackground(Void... params) {
                try {
                    return MJPApi.shared().get(Business.class, BusinessListFragment.selectedBusiness.getId());
                } catch (MJPApiException e) {
                    Popup.showGreen(e.getMessage(), null, null, "OK", null, true);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Business data) {
                if (data != null) {
                    AppHelper.hideLoading();
                    BusinessDetailFragment.requestReloadLocations = true;
                    BusinessListFragment.selectedBusiness = data;
                    getApp().popFragment();
                }
            }
        }.execute();
    }

}
