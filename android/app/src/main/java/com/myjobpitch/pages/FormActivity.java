package com.myjobpitch.pages;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.provider.MediaStore;
import android.support.v4.app.ActivityCompat;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.myjobpitch.R;
import com.myjobpitch.activities.DropboxActivity;
import com.myjobpitch.activities.GoogleDriveActivity;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

public class FormActivity extends MJPActivity {

    public void hideKeyboard() {
        if (getCurrentFocus() != null) {
            InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
            imm.hideSoftInputFromWindow(getCurrentFocus().getWindowToken(), 0);
        }
    }

    /* LoadingView View */

    @Override
    protected void showLoading(String label, ViewGroup view) {
        hideKeyboard();
        super.showLoading(label, view);
    }

    /* valid */

    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<>();
    };

    protected boolean valid() {

        boolean foundError = false;

        for (EditText view : getRequiredFields().values()) {
            if (view.getText().toString().isEmpty()) {
                view.setError(getString(R.string.field_required));
                if (!foundError) {
                    foundError = true;
                    view.requestFocus();
                }
            } else {
                view.setError(null);
            }
        }

        return !foundError;
    }

    /* Error */

    @Override
    protected void errorHandler(JsonNode errors) {

        boolean foundField = false;
        HashMap<String, EditText> requiredFields = getRequiredFields();

        for (String key : getRequiredFields().keySet()) {

            if (errors.has(key)) {

                JsonNode error = errors.get(key);
                String message = error.isArray() ? error.get(0).asText() : error.asText();

                EditText view = requiredFields.get(key);
                view.setError(message);

                if (!foundField) {
                    foundField = true;
                    view.requestFocus();
                }
            }
        }

        super.errorHandler(errors);
    }

    /* file picker */

    public static final int REQUEST_IMAGE_CAPTURE = 1;
    public static final int REQUEST_IMAGE_PICK = 2;
    public static final int REQUEST_GOOGLE_DRIVE = 3;
    public static final int REQUEST_DROPBOX = 4;

    private static final int PERMISSION_IAMGE_CAPTURE = 1;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE1 = 2;
    private static final int PERMISSION_WRITE_EXTERNAL_STORAGE2 = 3;

    public interface OnRemoveListener {
        void action();
    }

    public void showFilePicker(final boolean onlyImage, OnRemoveListener removeListener) {
        BottomSheetBuilder sheetBuilder = new BottomSheetBuilder(this)
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addTitleItem(R.string.image_selector_title)
                .addItem(0, R.string.image_selector_capture, R.drawable.ic_camera)
                .addItem(1, R.string.image_selector_storage, R.drawable.ic_loca_storage)
                .addDividerItem()
                .addItem(2, R.string.image_selector_google, R.drawable.ic_google_drive)
                .addItem(3, R.string.image_selector_dropbox, R.drawable.ic_dropbox)
                .addDividerItem()
                .setItemClickListener(item -> {
                    switch (item.getItemId()) {
                        case 0: {
                            final String[] permissions = {
                                    Manifest.permission.CAMERA,
                                    Manifest.permission.WRITE_EXTERNAL_STORAGE};
                            final List<String> permissionsToRequest = new ArrayList<>();
                            for (String permission : permissions) {
                                if (ActivityCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                                    permissionsToRequest.add(permission);
                                }
                            }
                            if (!permissionsToRequest.isEmpty()) {
                                ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[permissionsToRequest.size()]), PERMISSION_IAMGE_CAPTURE);
                            } else {
                                actionImageCapture();
                            }
                            break;
                        }
                        case 1: {
                            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                                String[] permissions = {Manifest.permission.WRITE_EXTERNAL_STORAGE};
                                ActivityCompat.requestPermissions(this, permissions,
                                        onlyImage ? PERMISSION_WRITE_EXTERNAL_STORAGE2 : PERMISSION_WRITE_EXTERNAL_STORAGE1);
                            } else {
                                actionPick(onlyImage);
                            }
                            break;
                        }
                        case 2: {
                            Intent intent = new Intent(this, GoogleDriveActivity.class);
                            intent.putExtra("onlyImage", onlyImage);
                            startActivityForResult(intent, REQUEST_GOOGLE_DRIVE);
                            break;
                        }
                        case 3: {
                            Intent intent = new Intent(this, DropboxActivity.class);
                            intent.putExtra("onlyImage", onlyImage);
                            startActivityForResult(intent, REQUEST_DROPBOX);
                            break;
                        }

                        case 4: {
                            removeListener.action();
                            break;
                        }
                    }
                });

        if (removeListener != null) {
            sheetBuilder.addItem(4, R.string.image_selector_remove, R.drawable.icon_remove);
        }

        sheetBuilder.createDialog().show();
    }

    void actionImageCapture() {
        Intent takePictureIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
        startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);
    }

    void actionPick(boolean onlyImage) {
        Intent intent = new Intent(Intent.ACTION_PICK);
        intent.setType(onlyImage ? "image/*" : "image/*");
        startActivityForResult(intent, REQUEST_IMAGE_PICK);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        for (int permission : grantResults) {
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }
        if (requestCode == PERMISSION_IAMGE_CAPTURE) {
            actionImageCapture();
        } else if (requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE1 || requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE2) {
            actionPick(requestCode == PERMISSION_WRITE_EXTERNAL_STORAGE2);
        }
    }

}
