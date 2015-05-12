package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.MenuItem;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;

public class MJPActionBarActivity extends ActionBarActivity implements MJPActivityInterface {
    public static final String FROM_LOGIN = "from_login";
    private final MJPActivityDelegate mActivityDelegate = createDelegate();
    private boolean mFromLogin = false;

    protected MJPActivityDelegate createDelegate() {
        return new MJPActivityDelegate(this);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null && savedInstanceState.containsKey(FROM_LOGIN))
            mFromLogin = savedInstanceState.getBoolean(FROM_LOGIN);
        else
            mFromLogin = getIntent().hasExtra(FROM_LOGIN);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putBoolean(FROM_LOGIN, mFromLogin);
    }

    @Override
    public void onBackPressed() {
        Log.d("MJPActionBarActivity", "back");
        if (mFromLogin) {
            DialogInterface.OnClickListener onLogout = new DialogInterface.OnClickListener() {
                public void onClick(DialogInterface dialog, int id) {
                    dialog.dismiss();
                    MJPActionBarActivity.super.onBackPressed();
                }
            };
            confirmLogout(onLogout);
        } else {
            super.onBackPressed();
        }
    }

    @Override
    public boolean onOptionsItemSelected(final MenuItem item) {
        Log.d("MJPActionBarActivity", "up");
        switch (item.getItemId()) {
            case android.R.id.home:
                if (getIntent().hasExtra(FROM_LOGIN)) {
                    DialogInterface.OnClickListener onLogout = new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            NavUtils.navigateUpFromSameTask(MJPActionBarActivity.this);
                        }
                    };
                    confirmLogout(onLogout);
                    return true;
                }
        }
        return super.onOptionsItemSelected(item);
    }

    private void confirmLogout(DialogInterface.OnClickListener onLogout) {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setMessage(R.string.confirm_logout)
                .setCancelable(false)
                .setPositiveButton(R.string.logout, onLogout)
                .setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                });
        AlertDialog alert = builder.create();
        alert.show();
    }

    @Override
    public MJPApi getApi() {
        return mActivityDelegate.getApi();
    }

    @Override
    public MJPApplication getMJPApplication() {
        return mActivityDelegate.getMJPApplication();
    }
}
