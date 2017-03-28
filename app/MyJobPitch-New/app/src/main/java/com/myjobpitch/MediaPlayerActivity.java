package com.myjobpitch;

import android.app.Activity;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.MediaController;
import android.widget.VideoView;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MediaPlayerActivity extends Activity {

    public static final String PATH = "path";

    @BindView(R.id.video)
    VideoView mVideoView;

    @BindView(R.id.progress)
    View mProgressView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_media_player);
        ButterKnife.bind(this);

        Uri video = Uri.parse(getIntent().getStringExtra(PATH));
        MediaController controller = new MediaController(this);
        mVideoView.setOnPreparedListener(new MediaPlayer.OnPreparedListener() {
            @Override
            public void onPrepared(MediaPlayer mp) {
                mProgressView.setVisibility(View.INVISIBLE);
            }
        });
        mVideoView.setMediaController(controller);
        mVideoView.setVideoURI(video);
        mVideoView.requestFocus();
        mVideoView.start();
    }
}
