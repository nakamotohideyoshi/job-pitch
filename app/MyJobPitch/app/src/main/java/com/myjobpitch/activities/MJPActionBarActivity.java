package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;

import com.myjobpitch.MjpApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;

public class MJPActionBarActivity extends ActionBarActivity {

    @Override
    public void onBackPressed() {
        Log.d("MJPActionBarActivity", "back");
        if (getIntent().hasExtra("from_login")) {
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
                if (getIntent().hasExtra("from_login")) {
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
        builder.setMessage("This will log you out. Are you sure?")
                .setCancelable(false)
                .setPositiveButton("Logout", onLogout)
                .setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int id) {
                        dialog.cancel();
                    }
                });
        AlertDialog alert = builder.create();
        alert.show();
    }

    MJPApi getApi() {
        return ((MjpApplication)getApplication()).getApi();
    }
}
