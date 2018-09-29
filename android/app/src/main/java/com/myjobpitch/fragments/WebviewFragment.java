package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class WebviewFragment extends BaseFragment {

    public String mFilename;

    @BindView(R.id.webview)
    WebView webView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view =  inflater.inflate(R.layout.fragment_webview, container, false);
        ButterKnife.bind(this, view);

        if (mFilename != null) {
            webView.loadUrl("file:///android_asset/" + mFilename + ".html");
        }

        return view;
    }

}
