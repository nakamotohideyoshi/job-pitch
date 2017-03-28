package com.myjobpitch;

import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.support.annotation.NonNull;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;
import android.widget.Toast;

import com.github.florent37.camerafragment.CameraFragment;
import com.github.florent37.camerafragment.CameraFragmentApi;
import com.github.florent37.camerafragment.configuration.Configuration;
import com.github.florent37.camerafragment.listeners.CameraFragmentResultAdapter;
import com.github.florent37.camerafragment.listeners.CameraFragmentResultListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;


public class CameraActivity extends AppCompatActivity {

    public static final String FILEPATH = "filepath";
    private static final int REQUEST_CODE = 10000;

    @BindView(R.id.switch_camera)
    ImageButton mSwitchCamera;

    @BindView(R.id.count)
    TextView mCountView;

    @BindView(R.id.record_button)
    Button mRecordButton;

    enum CaptureStatus {
        NONE, READY, CAPTURE
    }

    CaptureStatus captureStatus = CaptureStatus.NONE;
    CameraFragmentApi cameraApi;
    int count = 0;
    Timer timer;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);
        ButterKnife.bind(this);

        addCamera();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (timer != null) {
            timer.cancel();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length != 0) {
            addCamera();
        }
    }

    void addCamera() {

        if (Build.VERSION.SDK_INT > 15) {
            final String[] permissions = {
                    android.Manifest.permission.CAMERA,
                    android.Manifest.permission.RECORD_AUDIO,
                    android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
                    android.Manifest.permission.READ_EXTERNAL_STORAGE
            };

            final List<String> permissionsToRequest = new ArrayList<>();
            for (String permission : permissions) {
                if (ActivityCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                    permissionsToRequest.add(permission);
                }
            }
            if (!permissionsToRequest.isEmpty()) {
                ActivityCompat.requestPermissions(this, permissionsToRequest.toArray(new String[permissionsToRequest.size()]), REQUEST_CODE);
                return;
            }
        }

        Configuration.Builder builder = (new Configuration.Builder())
                .setCamera(Configuration.CAMERA_FACE_FRONT)
                .setFlashMode(Configuration.FLASH_MODE_OFF)
                .setMediaQuality(Configuration.MEDIA_QUALITY_MEDIUM)
                .setMediaAction(Configuration.MEDIA_ACTION_VIDEO);
        CameraFragment cameraFragment = CameraFragment.newInstance(builder.build());

        if (cameraFragment == null) return;

        getSupportFragmentManager().beginTransaction()
                .replace(R.id.content, cameraFragment)
                .commitAllowingStateLoss();

        cameraApi = cameraFragment;
        mSwitchCamera.setVisibility(View.VISIBLE);
        mRecordButton.setVisibility(View.VISIBLE);

        timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                Handler mainHandler = new Handler(CameraActivity.this.getMainLooper());
                Runnable myRunnable = new Runnable() {
                    @Override
                    public void run() {
                        update();
                    }
                };
                mainHandler.post(myRunnable);
            }
        }, 1000, 1000);

    }

    void update() {
        if (count > 0) {
            if (--count == 0) {
                if (captureStatus == CaptureStatus.READY) {
                    captureStatus = CaptureStatus.CAPTURE;
                    count = 30;
                    mCountView.setText(String.format("%d", count));
                    mRecordButton.setText("STOP");
                    mRecordButton.setBackgroundResource(R.drawable.camera_record_button);
                    cameraApi.takePhotoOrCaptureVideo(null, "/storage/self/primary", "photo0");
                } else {
                    endRecord();
                }
            }
            mCountView.setText(String.format("%d", count));
        }
    }

    void endRecord() {
        cameraApi.takePhotoOrCaptureVideo(new CameraFragmentResultAdapter() {
                                              @Override
                                              public void onVideoRecorded(String filePath) {
                                                  Intent intent = new Intent();
                                                  intent.putExtra(FILEPATH, filePath);
                                                  setResult(RESULT_OK, intent);
                                                  finish();
                                              }
                                              @Override
                                              public void onPhotoTaken(byte[] bytes, String filePath) {
                                              }
                                          },
                "/storage/self/primary",
                "photo0");
    }

    @OnClick(R.id.switch_camera)
    void onSwitchCamera() {
        if (captureStatus != CaptureStatus.CAPTURE) {
            cameraApi.switchCameraTypeFrontBack();
        }
    }

    @OnClick(R.id.record_button)
    void onRecordButton() {

        switch (captureStatus) {
            case NONE:
                captureStatus = CaptureStatus.READY;
                count = 10;
                mCountView.setText(String.format("%d", count));
                mRecordButton.setText("READY");
                mRecordButton.setBackgroundResource(R.drawable.camera_ready_button);
                break;

            case READY:
                captureStatus = CaptureStatus.NONE;
                count = 0;
                mCountView.setText("");
                mRecordButton.setText("RECORD");
                mRecordButton.setBackgroundResource(R.drawable.camera_normal_button);
                break;

            case CAPTURE:
                endRecord();
                break;
        }

    }

}