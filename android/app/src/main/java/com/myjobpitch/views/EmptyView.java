package com.myjobpitch.views;

import android.app.Activity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class EmptyView {

    @BindView(R.id.empty_text)
    TextView emptyText;
    @BindView(R.id.empty_button)
    TextView emptyButton;

    public View view;

    public EmptyView(Activity activity) {
        view = activity.getLayoutInflater().inflate(R.layout.view_empty_view, null);
        ButterKnife.bind(this, view);
    }

    public EmptyView setText(int resId) {
        emptyText.setText(resId);
        emptyText.setVisibility(View.VISIBLE);
        return this;
    }

    public EmptyView setButton(int resId, View.OnClickListener clickListener) {
        emptyButton.setText(resId);
        emptyButton.setOnClickListener(clickListener);
        emptyButton.setVisibility(View.VISIBLE);
        return this;
    }

    public EmptyView show(ViewGroup parent) {
        parent.addView(view);
        return this;
    }

    public void dismiss() {
        ((ViewGroup)view.getParent()).removeView(view);
    }

}
