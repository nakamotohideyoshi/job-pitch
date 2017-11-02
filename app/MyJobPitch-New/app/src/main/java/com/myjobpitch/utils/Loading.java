package com.myjobpitch.utils;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class Loading {

    @BindView(R.id.loading_text)
    TextView textLabel;

    @BindView(R.id.loading_indicator)
    ProgressBar indicator;

    @BindView(R.id.loading_progressbar)
    ProgressBar progressBar;

    View view;

    public enum Type { SPIN, PROGRESS }

    public Loading(Context context, View parent) {

        view = LayoutInflater.from(context).inflate(R.layout.view_loading, (ViewGroup) parent, false);
        ButterKnife.bind(this, view);
        ((ViewGroup) parent).addView(view);

        setType( Type.SPIN);
    }

    public void setType(Type type) {
        if (type == Type.SPIN) {
            indicator.setVisibility(View.VISIBLE);
            progressBar.setVisibility(View.GONE);
        } else {
            indicator.setVisibility(View.GONE);
            progressBar.setVisibility(View.VISIBLE);
            progressBar.setProgress(0);
        }
        setLabel("");
    }

    public void setBackground(int color) {
        view.setBackgroundResource(color);
    }

    public void setProgress(int progress) {
        progressBar.setProgress(progress);
    }

    public void setLabel(String label) {
        if (label == null || label.trim().equals("")) {
            textLabel.setVisibility(View.GONE);
        } else {
            textLabel.setVisibility(View.VISIBLE);
            textLabel.setText(label);
        }
    }

    public void destroy() {
        ((ViewGroup)view.getParent()).removeView(view);
    }

}
