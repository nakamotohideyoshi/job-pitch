package com.myjobpitch.fragments;

import android.content.Intent;
import android.support.annotation.DrawableRes;
import android.support.v4.app.Fragment;
import android.support.v7.app.ActionBar;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.views.Popup;

public class BaseFragment extends Fragment {

    public String title = "";

    protected final int MENUGROUP1 = 10;
    protected final int MENUGROUP2 = 11;    // disable when loading

    protected MainActivity getApp() {
        return MainActivity.shared();
    }

    /* loading view */

    protected Loading loading;

    protected void showLoading() {
        showLoading("", null);
    }

    protected void showLoading(String label) {
        showLoading(label, null);
    }

    protected void showLoading(View view) {
        showLoading("", view);
    }
    
    protected void showLoading(String label, View view) {
        getApp().hideKeyboard();
        if (loading == null) {
            loading = new Loading(getContext(), view != null ? view : getView());
            loading.setLabel(label);
            getApp().getToolbarMenu().setGroupEnabled(MENUGROUP2, false);
        }
    }

    protected void hideLoading() {
        if (loading != null) {
            loading.destroy();
            loading = null;
            getApp().getToolbarMenu().setGroupEnabled(MENUGROUP2, true);
        }
    }

    /* menu item */

    protected MenuItem addMenuItem(int group, int id, String text, @DrawableRes int iconRes) {
        MenuItem menuItem = getApp().getToolbarMenu().add(group, id, 1, text);
        if (iconRes != -1) {
            menuItem.setIcon(iconRes);
        }
        menuItem.setTitle(text);
        menuItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        return menuItem;
    }

    protected MenuItem changeMenuItem(int id, @DrawableRes int iconRes) {
        MenuItem menuItem = getApp().getToolbarMenu().findItem(id);
        if(iconRes != -1) {
            menuItem.setIcon(iconRes);
        }
        menuItem.setVisible(true);
        return  menuItem;
    }

    protected MenuItem setVisibleMenuItem(int id, Boolean isVisible) {
        MenuItem menuItem = getApp().getToolbarMenu().findItem(id);
        menuItem.setVisible(isVisible);

        return menuItem;
    }

    public void onMenuSelected(int menuID) {
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
    }

    public void errorHandler(JsonNode errors) {
        hideLoading();

        if (errors == null) {
            Popup popup = new Popup(getContext(), R.string.error_no_connection, true);
            popup.addGreyButton(R.string.ok, null);
            popup.show();
        }
    }

    @Override
    public void onResume() {
        super.onResume();

        getApp().hideKeyboard();

        ActionBar actionBar = getApp().getSupportActionBar();

        if (getApp().getCurrentMenuID() != -1) {
            actionBar.show();
            actionBar.setTitle(title);
        } else {
            actionBar.hide();
        }
    }
}
