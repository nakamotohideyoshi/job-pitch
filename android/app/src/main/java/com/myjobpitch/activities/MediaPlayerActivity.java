package com.myjobpitch.activities;

import android.app.Activity;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.MediaController;
import android.widget.VideoView;

import com.myjobpitch.R;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MediaPlayerActivity extends Activity {

    public static final String PATH = "path";

    @BindView(R.id.videoView)
    VideoView mVideoView;

    @BindView(R.id.progress)
    View mProgressView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_media_player);
        ButterKnife.bind(this);

        if (getIntent().getExtras() != null) {
            String url = getIntent().getStringExtra(PATH);
            if (url != null) {
                mVideoView.setOnPreparedListener(mp -> mProgressView.setVisibility(View.INVISIBLE));
                mVideoView.setMediaController(new MediaController(this));
                mVideoView.setVideoURI(Uri.parse(url));
                mVideoView.start();
            }
        }
    }

}
