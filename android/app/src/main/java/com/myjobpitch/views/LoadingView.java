package com.myjobpitch.views;

import android.app.Activity;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class LoadingView {

    @BindView(R.id.loading_text)
    TextView mTextLabel;

    @BindView(R.id.loading_indicator)
    ProgressBar mIndicator;

    @BindView(R.id.loading_progressbar)
    ProgressBar mProgressBar;

    public View view;

    public LoadingView(Activity activity) {
        view = activity.getLayoutInflater().inflate(R.layout.view_loading_new, null);
        view.setClickable(true);
        ButterKnife.bind(this, view);
    }

    public void setBackground(int color) {
        view.setBackgroundResource(color);
    }

    public void setLabel(String label) {
        mTextLabel.setVisibility(label != null ? View.VISIBLE : View.GONE);
        mTextLabel.setText(label);
    }

    public void showLoading(boolean visible) {
        mIndicator.setVisibility(visible ? View.VISIBLE : View.GONE);
    }

    public void setProgress(int progress) {
        mProgressBar.setVisibility(progress > 0 ? View.VISIBLE : View.GONE);
        mProgressBar.setProgress(progress);
    }
}
