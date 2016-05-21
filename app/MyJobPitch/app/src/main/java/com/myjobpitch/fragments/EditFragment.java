package com.myjobpitch.fragments;

import android.support.v4.app.Fragment;
import android.text.TextUtils;
import android.view.View;
import android.widget.CheckBox;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;

/**
 * Created by Jamie on 11/04/2015.
 */
public class EditFragment<T> extends Fragment implements CreateReadUpdateAPITaskListener<T> {
    private Collection<View> requiredFields;
    private Map<String, View> fields;

    public boolean validateInput() {
        for (View field : fields.values())
            getTextViewForField(field).setError(null);

        View errorField = null;
        for (View field : requiredFields) {
            if (field instanceof TextView) {
                TextView textView = (TextView) field;
                if (TextUtils.isEmpty(textView.getText())) {
                    textView.setError(getString(R.string.error_field_required));
                    if (errorField == null)
                        errorField = field;
                }
            } else if (field instanceof Spinner) {
                Spinner spinner = (Spinner) field;
                if (spinner.getSelectedItem() == null) {
                    getTextViewForField(field).setError(getString(R.string.error_field_required));
                    errorField = field;
                }
            }
        }

        if (errorField != null) {
            errorField.requestFocus();
            return false;
        }
        return true;
    }

    private TextView getTextViewForField(View field) {
        if (field instanceof TextView)
            return (TextView) field;
        else if (field instanceof Spinner)
            return (TextView) ((Spinner)field).getChildAt(0);
        return null;
    }

    @Override
    public void onSuccess(T job) {}

    @Override
    public void onError(JsonNode errors) {
        Iterator<Map.Entry<String, JsonNode>> error_data = errors.fields();
        while (error_data.hasNext()) {
            Map.Entry<String, JsonNode> error = error_data.next();
            String errorText = error.getValue().get(0).asText();
            if (this.fields.containsKey(error.getKey())) {
                TextView textView = getTextViewForField(this.fields.get(error.getKey()));
                if (textView != null)
                    textView.setError(errorText);
                else
                    Toast.makeText(getActivity(), String.format("Error: {}", errorText), Toast.LENGTH_LONG).show();
            } else
                Toast.makeText(getActivity(), String.format("Error: {}", errorText), Toast.LENGTH_LONG).show();
        }
    }

    @Override
    public void onConnectionError() {
        Toast toast = Toast.makeText(getActivity(), "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
        toast.show();
    }

    @Override
    public void onCancelled() {}

    public void setFields(Map<String,View> fields) {
        this.fields = fields;
    }

    public void setRequiredFields(Collection<View> requiredFields) {
        this.requiredFields = requiredFields;
    }
}
