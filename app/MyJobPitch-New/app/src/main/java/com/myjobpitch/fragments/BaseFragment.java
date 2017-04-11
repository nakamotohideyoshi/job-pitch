package com.myjobpitch.fragments;

import android.content.Intent;
import android.support.annotation.DrawableRes;
import android.support.v4.app.Fragment;
import android.view.Menu;
import android.view.MenuItem;

import com.myjobpitch.MainActivity;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.Popup;

public class BaseFragment extends Fragment implements APITask.ErrorListener {

    public String title = "";

    protected MainActivity getApp() {
        return MainActivity.instance;
    }

    protected MenuItem addMenuItem(String text, @DrawableRes int iconRes) {
        MenuItem menuItem = getApp().getToolbarMenu().add(Menu.NONE, 100, 1, text);
        if (iconRes != -1) {
            menuItem.setIcon(iconRes);
        }
        menuItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        return menuItem;
    }

    public void onError(MJPApiException e) {
        Popup.showError(e.getMessage());
    }

    public void onMenuSelected(int menuID) {
    }

    public void onActivityResult(int requestCode, int resultCode, Intent data) {
    }

    @Override
    public void onResume() {
        super.onResume();

        getApp().hideKeyboard();

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
