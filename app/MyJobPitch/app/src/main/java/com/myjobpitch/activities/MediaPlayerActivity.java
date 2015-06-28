package com.myjobpitch.activities;

import android.app.Activity;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.MediaController;
import android.widget.VideoView;

import com.myjobpitch.R;

public class MediaPlayerActivity extends Activity {
    private static final String TAG = "MediaPlayerActivity";
    private VideoView mVideoView;
    private View mProgressView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_media_player);

        mVideoView = (VideoView) findViewById(R.id.video);
        mProgressView = findViewById(R.id.progress);
        Uri video = Uri.parse(getIntent().getStringExtra("url"));
        Log.d(TAG, "Playing " + video);
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
