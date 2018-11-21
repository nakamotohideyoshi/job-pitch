package com.myjobpitch.pages.recruiter;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.pages.FormActivity;
import com.myjobpitch.pages.LoginActivity;
import com.myjobpitch.pages.MainActivity;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.ImageSelectorNew;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.io.File;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessEditActivity extends FormActivity {

    @BindView(R.id.image_view)
    ImageView logoView;

    @BindView(R.id.business_name)
    MaterialEditText nameView;

    @BindView(R.id.business_credits)
    TextView creditsView;

    @BindView(R.id.add_credits_button)
    Button addCreditsButton;

    boolean addMode = false;
    Business business;
    ImageSelectorNew imageSelector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_business_edit);
        ButterKnife.bind(this);

        imageSelector = new ImageSelectorNew(this, logoView, R.drawable.default_logo);

        if (business == null) {

            addMode = true;
            getSupportActionBar().setTitle(R.string.add_business);

        } else {

            getSupportActionBar().setTitle(R.string.edit_business);

            List<Image> images = business.getImages();
            imageSelector.loadImage(images.size() > 0 ? images.get(0).getThumbnail() : null);

            creditsView.setText(String.format("%d", business.getTokens()));
            addCreditsButton.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("name", nameView);
            }
        };
    }

    @OnClick({R.id.image_view, R.id.image_add_button})
    void onChangeLogo() {
        showFilePicker(true, imageSelector.getImageUri() != null ? (OnRemoveListener) () -> {
            imageSelector.loadImage(null);
        } : null);
    }

    @OnClick(R.id.add_credits_button)
    void onCredits() {
//        PaymentFragment fragment = new PaymentFragment();
//        fragment.business = business;
//        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.save_button)
    void saveBusiness() {

        if (!valid()) return;

        Business newBusiness = new Business();
        newBusiness.setName(nameView.getText().toString().trim());

        showLoading();

        new APITask(() -> {
            if (business == null) {
                business = MJPApi.shared().createBusiness(newBusiness);
            } else {
                business = MJPApi.shared().updateBusiness(business.getId(), newBusiness);
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

        Uri uri = imageSelector.getImageUri();

        if (uri != null) {

            new UploadImageTask(this, "user-business-images", "business", imageSelector.getImageUri(), business)
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

        } else if (business.getImages().size() > 0 && imageSelector.isDefaultImage()){

            new APITask(() -> MJPApi.shared().deleteBusinessImage(business.getImages().get(0).getId())).addListener(new APITaskListener() {
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

        if (AppData.user.getBusinesses().size() == 0) {
            AppData.startTimer();

//            getApp().getSharedPreferences("firstCreate", MODE_PRIVATE).edit()
//                    .putBoolean("workplace", true)
//                    .apply();

            Intent intent = new Intent(this, MainActivity.class);
            startActivity(intent);
            overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        }

        AppData.updateBusiness(business);

        finish();
//        getApp().getSupportFragmentManager().popBackStackImmediate();
//        BusinessDetailsFragment fragment = new BusinessDetailsFragment();
//        fragment.isFirstCreate = isFirstCreate;
//        fragment.businessId = business.getId();
//        getApp().pushFragment(fragment);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == REQUEST_IMAGE_CAPTURE) {
                Bitmap photo = (Bitmap) data.getExtras().get("data");
                imageSelector.setImage(photo);
            } else if (requestCode == REQUEST_IMAGE_PICK) {
                imageSelector.setImage(data.getData());
            } else if (requestCode == REQUEST_GOOGLE_DRIVE || requestCode == REQUEST_DROPBOX) {
                String path = (String) data.getExtras().get("path");
                imageSelector.setImage(Uri.fromFile(new File(path)));
            }
        }
    }

    @Override
    public void onBackPressed() {
        new AlertDialog.Builder(this)
                .setMessage(R.string.logout_message)
                .setPositiveButton(R.string.logout_button, (dialog, id) -> {
                    Intent intent = new Intent(this, LoginActivity.class);
                    startActivity(intent);
                    overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                    finish();
                })
                .setNegativeButton(R.string.cancel, null)
                .create()
                .show();
    }
}
