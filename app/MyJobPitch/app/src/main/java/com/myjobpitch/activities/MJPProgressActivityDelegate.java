package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.view.View;

public class MJPProgressActivityDelegate extends MJPActivityDelegate {
    private final Context mContext;
    private final MJPProgressActivityInterface mProgressActivityInterface;
    View mProgressView;
    View mMainView;

    public MJPProgressActivityDelegate(Activity context, MJPProgressActivityInterface progressActivityInterface) {
        super(context);
        this.mContext = context;
        this.mProgressActivityInterface = progressActivityInterface;

    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        if (mMainView == null)
            mMainView = mProgressActivityInterface.getMainView();
        if (mProgressView == null)
            mProgressView = mProgressActivityInterface.getProgressView();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR2) {
            int shortAnimTime = mContext.getResources().getInteger(android.R.integer.config_shortAnimTime);

            mMainView.setVisibility(show ? View.GONE : View.VISIBLE);
            mMainView.animate().setDuration(shortAnimTime).alpha(
                    show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mMainView.setVisibility(show ? View.GONE : View.VISIBLE);
                }
            });

            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mProgressView.animate().setDuration(shortAnimTime).alpha(
                    show ? 1 : 0).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
                }
            });
        } else {
            // The ViewPropertyAnimator APIs are not available, so simply show
            // and hide the relevant UI components.
            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mMainView.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
}