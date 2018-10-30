package com.myjobpitch.activities;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.webkit.WebView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class WebviewActivity extends AppCompatActivity {

    public static final String TITLE = "title";
    public static final String FILENAME = "filename";

    @BindView(R.id.toolbar)
    Toolbar mToolbar;

    @BindView(R.id.webview)
    WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_webview);
        ButterKnife.bind(this);

        mToolbar.setTitle(getIntent().getStringExtra(TITLE));
        setSupportActionBar(mToolbar);

        String fileName = getIntent().getStringExtra(FILENAME);
        webView.loadUrl("file:///android_asset/" + fileName + ".html");
    }

}
