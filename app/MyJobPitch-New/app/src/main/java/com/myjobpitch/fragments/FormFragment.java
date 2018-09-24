package com.myjobpitch.fragments;

import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.views.Popup;

import java.util.HashMap;
import java.util.Iterator;

public class FormFragment extends BaseFragment {

    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<>();
    };

    protected boolean valid() {

        EditText errorView = null;

        for (EditText view : getRequiredFields().values()) {
            if (view.getText().toString().isEmpty()) {
                view.setError(getString(R.string.error_field_required));
                if (errorView == null) {
                    errorView = view;
                    errorView.getParent().requestChildFocus(errorView,errorView);
                }
            } else {
                view.setError(null);
            }
        }

        return errorView == null;

    }

    public void errorHandler(JsonNode errors) {

        hideLoading();

        if (errors == null) {
            Popup popup = new Popup(getContext(), "Connection Error: Please check your internet connection", true);
            popup.addGreyButton("Ok", null);
            popup.show();
            return;
        }

        HashMap<String, EditText> requiredFields = getRequiredFields();
        EditText errorView = null;
        String errorMessage = null;

        Iterator<String> fieldNames = errors.fieldNames();
        while (fieldNames.hasNext()) {
            String fieldName = fieldNames.next();
            JsonNode fieldValue = errors.get(fieldName);
            if (fieldValue.isArray()) {
                String message = fieldValue.get(0).asText();
                if (requiredFields.containsKey(fieldName)) {
                    EditText view = requiredFields.get(fieldName);
                    view.setError(message);
                    if (errorView == null) {
                        errorView = view;
                        errorView.requestFocus();
                    }
                } else {
                    errorMessage = message;
                }
            } else {
                errorMessage = fieldValue.asText();
            }
        }

        if (errorView == null && errorMessage != null) {
            Popup popup = new Popup(getContext(), errorMessage, true);
            popup.addGreyButton("Ok", null);
            popup.show();
        }

    }

}
