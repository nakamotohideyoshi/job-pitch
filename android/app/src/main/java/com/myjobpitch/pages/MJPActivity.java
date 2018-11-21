package com.myjobpitch.pages;

import android.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.view.ViewGroup;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.views.LoadingView;

public class MJPActivity extends AppCompatActivity {

    /* LoadingView View */

    protected LoadingView loading;

    protected void showLoading() {
        showLoading(null, null);
    }

    protected void showLoading(String label) {
        showLoading(label, null);
    }

    protected void showLoading(String label, ViewGroup view) {
        if (loading == null) {
            loading = new LoadingView(this);
            loading.setLabel(label);
            if (view == null) {
                view = (ViewGroup)getWindow().getDecorView().getRootView().findViewById(android.R.id.content);
            }
            view.addView(loading.view);
//            getApp().getToolbarMenu().setGroupEnabled(MENUGROUP2, false);
        }
    }

    protected void hideLoading() {
        if (loading != null) {
            ((ViewGroup)loading.view.getParent()).removeView(loading.view);
            loading = null;
//            getApp().getToolbarMenu().setGroupEnabled(MENUGROUP2, true);
        }
    }

    /* Error */

    protected void errorHandler(JsonNode errors) {
        hideLoading();

        JsonNode error = null;


        if (errors != null) {
            if (errors.has("detail")) {
                error = errors.get("detail");
            } else if (errors.has("non_field_errors")) {
                error = errors.get("non_field_errors");
            }
        }

        if (error != null) {
            String message = error.isArray() ? error.get(0).asText() : error.asText();
            new AlertDialog.Builder(MJPActivity.this, android.R.style.Theme_Material_Dialog_Alert)
                    .setTitle(R.string.error)
                    .setMessage(message)
                    .setPositiveButton(R.string.ok, null)
                    .setCancelable(false)
                    .create()
                    .show();
        }
    }

    /* SharedPreferences */

    public String loadData(String key) {
        return getSharedPreferences("MJP_DATA", AppCompatActivity.MODE_PRIVATE)
                .getString(key, null);
    }

    public void saveData(String key, String value) {
        getSharedPreferences("MJP_DATA", AppCompatActivity.MODE_PRIVATE)
                .edit()
                .putString(key, value)
                .apply();
    }
}
