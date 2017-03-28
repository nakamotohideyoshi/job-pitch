package com.myjobpitch.fragments;

import android.content.Intent;
import android.os.Handler;
import android.support.v4.app.Fragment;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.MainActivity;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import java.util.Iterator;

public class BaseFragment extends Fragment {

    public String title = "";

    protected MainActivity getApp() {
        return MainActivity.instance;
    }

    protected Object[][] getRequiredFields() {
        return null;
    };

    protected boolean valid() {

        TextView errorView = null;

        Object[][] requiredFields = getRequiredFields();

        for (int i = 0; i < requiredFields.length; i++) {
            Object[] fieldInfo = requiredFields[i];
            if (fieldInfo.length == 2 && fieldInfo[1] instanceof TextView) {
                TextView textView = (TextView) fieldInfo[1];
                if (textView.getText().toString().isEmpty()) {
                    textView.setError(getString(R.string.error_field_required));
                    if (errorView == null) errorView = textView;
                } else {
                    textView.setError(null);
                }
            }
        }

        if (errorView != null) {
            errorView.requestFocus();
        }

        return errorView == null;

    }

    protected void handleErrors(final MJPApiException e) {

        AppHelper.hideLoading();

        Handler mainHandler = new Handler(getApp().getMainLooper());

        Runnable myRunnable = new Runnable() {
            @Override
            public void run() {

                Object[][] requiredFields = getRequiredFields();
                JsonNode errors = e.getErrors();
                Iterator<String> fieldNames = errors.fieldNames();
                boolean focus = false;

                while (fieldNames.hasNext()) {
                    String fieldName = fieldNames.next();
                    JsonNode fieldValue = errors.get(fieldName);
                    if (fieldValue.isArray()) {
                        String message = fieldValue.get(0).asText();
                        TextView errorView = null;

                        for (int i = 0; i < requiredFields.length; i++) {
                            Object[] fieldInfo = requiredFields[i];
                            if (fieldInfo.length == 2 && fieldInfo[0].equals(fieldName) && fieldInfo[1] instanceof TextView) {
                                errorView = (TextView) fieldInfo[1];
                                errorView.setError(message);
                                if (!focus) {
                                    errorView.requestFocus();
                                    focus = true;
                                }
                                break;
                            }
                        }

                        if (errorView == null) {
                            Popup.showMessage(message);
                            return;
                        }

                    } else {
                        String message = fieldValue.asText();
                        Popup.showMessage(message);
                        return;
                    }
                }
            }
        };

        mainHandler.post(myRunnable);

    }

    public void onMenuSelected(int menuID) {
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
    }

    @Override
    public void onResume() {
        super.onResume();
        if (getApp().getCurrentPageID() != -1) {
            if (!getApp().getSupportActionBar().isShowing())
                getApp().getSupportActionBar().show();
            getApp().getSupportActionBar().setTitle(title);
        } else {
            if (getApp().getSupportActionBar().isShowing())
                getApp().getSupportActionBar().hide();
        }
    }
}
