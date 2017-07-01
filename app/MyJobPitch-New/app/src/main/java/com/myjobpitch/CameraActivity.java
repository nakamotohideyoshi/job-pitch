package com.myjobpitch;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.support.v4.app.ActivityCompat;
import android.support.v7.app.AppCompatActivity;
import android.view.Surface;
import android.view.TextureView;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class CameraActivity extends AppCompatActivity {
    public static final String OUTPUT_FILE = "output_file";
    private static final int REQUEST_CAMERA_PERMISSIONS = 10000;

    @BindView(R.id.camera_preview)
    TextureView mPreview;

    @BindView(R.id.switch_camera)
    ImageButton mSwitchButton;

    @BindView(R.id.record_button)
    Button mRecordButton;

    @BindView(R.id.camera_text)
    TextView mCameraText;

    private Camera mCamera;
    private Camera.CameraInfo mCameraInfo;
    private MediaRecorder mMediaRecorder;
    private CamcorderProfile mProfile;
    private String mOutputFile;
    private int cameraDirection = Camera.CameraInfo.CAMERA_FACING_FRONT;

    private enum CaptureStatus {
        NONE, READY, CAPTURE
    }
    private CaptureStatus captureStatus = CaptureStatus.NONE;
    private int count = 0;
    private Timer timer;

    private SensorManager sensorManager;
    private int recorderDegrees;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_camera);
        ButterKnife.bind(this);

        // check permistion

        mPreview.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
                final String[] permissions = {
                        Manifest.permission.CAMERA,
                        Manifest.permission.RECORD_AUDIO,
                        Manifest.permission.WRITE_EXTERNAL_STORAGE,
                        Manifest.permission.READ_EXTERNAL_STORAGE };
                final List<String> permissionsToRequest = new ArrayList<>();
                for (String permission : permissions) {
                    if (ActivityCompat.checkSelfPermission(CameraActivity.this, permission) != PackageManager.PERMISSION_GRANTED) {
                        permissionsToRequest.add(permission);
                    }
                }
                if (!permissionsToRequest.isEmpty()) {
                    ActivityCompat.requestPermissions(CameraActivity.this, permissionsToRequest.toArray(new String[permissionsToRequest.size()]), REQUEST_CAMERA_PERMISSIONS);
                } else {
                    initCamera();
                }
            }
            @Override
            public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
            }
            @Override
            public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
                return true;
            }
            @Override
            public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
        });

    }

    private void initCamera() {
        mOutputFile = getOutputMediaFile().toString();

        sensorManager = (SensorManager) getSystemService(Activity.SENSOR_SERVICE);
        sensorManager.registerListener(sensorEventListener, sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER), SensorManager.SENSOR_DELAY_NORMAL);

        mSwitchButton.setVisibility(View.VISIBLE);
        mRecordButton.setVisibility(View.VISIBLE);
        startPreview();
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[], int[] grantResults) {
        for (int permission : grantResults) {
            if (permission != PackageManager.PERMISSION_GRANTED) {
                return;
            }
        }
        initCamera();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) {
            sensorManager.unregisterListener(sensorEventListener);
        }
        cleaerTimer();
        releaseMediaRecorder();
        releaseCamera();
    }

    @OnClick(R.id.switch_camera)
    void onSwitchCamera() {
        releaseMediaRecorder();
        toggleCamera();
        startPreview();
    }

    @OnClick(R.id.record_button)
    void onRecord() {
        switch (captureStatus) {
            case NONE:
                captureStatus = CaptureStatus.READY;
                count = 10;
                mCameraText.setText(String.format("%d", count));
                mRecordButton.setText("READY");
                mRecordButton.setBackgroundResource(R.drawable.camera_ready_button);
                mSwitchButton.setVisibility(View.INVISIBLE);
                createTimer();
                break;
            case READY:
                captureStatus = CaptureStatus.NONE;
                count = 0;
                mCameraText.setText("");
                mRecordButton.setText("RECORD");
                mRecordButton.setBackgroundResource(R.drawable.camera_normal_button);
                mSwitchButton.setVisibility(View.VISIBLE);
                createTimer();
                break;
            case CAPTURE:
                stopRecording();
                break;
        }
    }

    private void createTimer() {
        cleaerTimer();
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

    private void cleaerTimer() {
        if (timer != null) {
            timer.cancel();
            timer.purge();
            timer = null;
        }
    }

    private void update() {
        if (count > 0) {
            if (--count == 0) {
                if (captureStatus == CaptureStatus.READY) {
                    captureStatus = CaptureStatus.CAPTURE;
                    count = 30;
                    mCameraText.setText(String.format("%d", count));
                    mRecordButton.setText("STOP");
                    mRecordButton.setBackgroundResource(R.drawable.camera_record_button);

                    new AsyncTask<Void, Void, Boolean>() {
                        @Override
                        protected Boolean doInBackground(Void... params) {
                            if (prepareMediaRecorder()) {
                                mMediaRecorder.start();
                                return true;
                            } else {
                                releaseMediaRecorder();
                                return false;
                            }
                        }
                        @Override
                        protected void onPostExecute(Boolean success) {
                            if (!success) {
                                finish();
                            }
                        }
                    }.execute();
                } else {
                    stopRecording();
                }
            }
            mCameraText.setText(String.format("%d", count));
        }
    }

    private void startPreview() {

        mRecordButton.setEnabled(false);

        // open camera

        if (! openCamera(cameraDirection)) {
            toggleCamera();
            if (! openCamera(cameraDirection)) {
                return;
            }
        }

        mCamera.lock();

        // get orientation

        int orientation = 0;
        switch (getWindowManager().getDefaultDisplay().getRotation()) {
            case Surface.ROTATION_0: orientation = 0; break;
            case Surface.ROTATION_90: orientation = 90; break;
            case Surface.ROTATION_180: orientation = 180; break;
            case Surface.ROTATION_270: orientation = 270; break;
        }
        if (mCameraInfo.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            orientation = (360 - (mCameraInfo.orientation + orientation) % 360) % 360;
        } else {
            orientation = (mCameraInfo.orientation - orientation + 360) % 360;
        }
        mCamera.setDisplayOrientation(orientation);

        Camera.Parameters parameters = mCamera.getParameters();

        parameters.setRotation(orientation);

        // get size

        int width, height;
        if (orientation == 90 || orientation == 270) {
            width = mPreview.getHeight();
            height = mPreview.getWidth();
        } else {
            width = mPreview.getWidth();
            height = mPreview.getHeight();
        }

        Camera.Size optimalSize = getOptimalVideoSize(parameters.getSupportedVideoSizes(),
                parameters.getSupportedPreviewSizes(),
                width, height);

        mProfile = CamcorderProfile.get(CamcorderProfile.QUALITY_HIGH);
        mProfile.videoFrameWidth = optimalSize.width;
        mProfile.videoFrameHeight = optimalSize.height;

        parameters.setPreviewSize(mProfile.videoFrameWidth, mProfile.videoFrameHeight);


        mCamera.setParameters(parameters);
        mCamera.startPreview();
        try {
            mCamera.setPreviewTexture(mPreview.getSurfaceTexture());
        } catch (IOException e) {
        }

        if (orientation == 90 || orientation == 270) {
            adjustAspectRatio(mProfile.videoFrameHeight, mProfile.videoFrameWidth);
        } else {
            adjustAspectRatio(mProfile.videoFrameWidth, mProfile.videoFrameHeight);
        }

        mRecordButton.setEnabled(true);
    }

    private void toggleCamera() {
        cameraDirection = cameraDirection == Camera.CameraInfo.CAMERA_FACING_FRONT ?
                Camera.CameraInfo.CAMERA_FACING_BACK :
                Camera.CameraInfo.CAMERA_FACING_FRONT;
    }

    private boolean openCamera(int position) {
        releaseCamera();
        Camera.CameraInfo cameraInfo = new Camera.CameraInfo();
        for (int i = 0; i < Camera.getNumberOfCameras(); i++) {
            Camera.getCameraInfo(i, cameraInfo);
            if (cameraInfo.facing == position) {
                mCamera = Camera.open(i);
                mCameraInfo = cameraInfo;
                return true;
            }
        }
        return false;
    }

    private void releaseCamera() {
        if (mCamera != null){
            mCamera.release();
            mCamera = null;
        }
    }

    private Camera.Size getOptimalVideoSize(List<Camera.Size> supportedVideoSizes,
                                            List<Camera.Size> previewSizes, int w, int h) {

        // Use a very small tolerance because we want an exact match.
        final double ASPECT_TOLERANCE = 0.1;
        double targetRatio = (double) w / h;

        // Supported video sizes list might be null, it means that we are allowed to use the preview
        // sizes
        List<Camera.Size> videoSizes;
        if (supportedVideoSizes != null) {
            videoSizes = supportedVideoSizes;
        } else {
            videoSizes = previewSizes;
        }
        Camera.Size optimalSize = null;

        // Start with max value and refine as we iterate over available video sizes. This is the
        // minimum difference between view and camera height.
        double minDiff = Double.MAX_VALUE;

        // Target view height
        int targetHeight = h;

        // Try to find a video size that matches aspect ratio and the target view size.
        // Iterate over all available sizes and pick the largest size that can fit in the view and
        // still maintain the aspect ratio.
        for (Camera.Size size : videoSizes) {
            double ratio = (double) size.width / size.height;
            if (Math.abs(ratio - targetRatio) > ASPECT_TOLERANCE)
                continue;
            if (Math.abs(size.height - targetHeight) < minDiff && previewSizes.contains(size)) {
                optimalSize = size;
                minDiff = Math.abs(size.height - targetHeight);
            }
        }

        // Cannot find video size that matches the aspect ratio, ignore the requirement
        if (optimalSize == null) {
            minDiff = Double.MAX_VALUE;
            for (Camera.Size size : videoSizes) {
                if (Math.abs(size.height - targetHeight) < minDiff && previewSizes.contains(size)) {
                    optimalSize = size;
                    minDiff = Math.abs(size.height - targetHeight);
                }
            }
        }

        return optimalSize;
    }

    private void adjustAspectRatio(int videoWidth, int videoHeight) {
        int viewWidth = mPreview.getWidth();
        int viewHeight = mPreview.getHeight();
        double aspectRatio = (double) videoHeight / videoWidth;

        int newWidth, newHeight;
        if (viewHeight > (int) (viewWidth * aspectRatio)) {
            newWidth = viewWidth;
            newHeight = (int) (viewWidth * aspectRatio);
        } else {
            newWidth = (int) (viewHeight / aspectRatio);
            newHeight = viewHeight;
        }
        int xoff = (viewWidth - newWidth) / 2;
        int yoff = (viewHeight - newHeight) / 2;

        Matrix txform = new Matrix();
        mPreview.getTransform(txform);
        txform.setScale((float) newWidth / viewWidth, (float) newHeight / viewHeight);
        txform.postTranslate(xoff, yoff);
        mPreview.setTransform(txform);
    }

    private boolean prepareMediaRecorder(){
        mMediaRecorder = new MediaRecorder();

        mCamera.unlock();
        mMediaRecorder.setCamera(mCamera);
        mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.CAMCORDER);
        mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);
        mMediaRecorder.setProfile(mProfile);
        mMediaRecorder.setOutputFile(mOutputFile);
        mMediaRecorder.setOrientationHint(recorderDegrees);

        try {
            mMediaRecorder.prepare();
            return true;
        } catch (IllegalStateException e) {
        } catch (IOException e) {
        }

        releaseMediaRecorder();
        return false;
    }

    private void stopRecording() {
        cleaerTimer();

        try {
            if (mMediaRecorder != null)
                mMediaRecorder.stop();
        } catch (Exception e) {
        }

        releaseMediaRecorder();

        Intent intent = new Intent();
        intent.putExtra(OUTPUT_FILE, mOutputFile);
        setResult(Activity.RESULT_OK, intent);
        finish();
    }

    private void releaseMediaRecorder() {
        if (mMediaRecorder != null) {
            mMediaRecorder.reset();
            mMediaRecorder.release();
            mMediaRecorder = null;
            mCamera.lock();
        }
    }

    private File getOutputMediaFile(){
        if (!Environment.getExternalStorageState().equalsIgnoreCase(Environment.MEDIA_MOUNTED)) {
            return  null;
        }

        File mediaStorageDir = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES), "MyJobPitch");
        if (! mediaStorageDir.exists()){
            if (! mediaStorageDir.mkdirs()) {
                return null;
            }
        }

        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        File mediaFile = new File(mediaStorageDir.getPath() + File.separator + "VID_"+ timeStamp + ".mp4");
        return mediaFile;
    }


    private SensorEventListener sensorEventListener = new SensorEventListener() {
        @Override
        public void onSensorChanged(SensorEvent event) {
            if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
                if (event.values[0] < 4 && event.values[0] > -4) {
                    if (event.values[1] > 0) {
                        recorderDegrees = cameraDirection == Camera.CameraInfo.CAMERA_FACING_FRONT ? 270 : 90;
                    } else if (event.values[1] < 0) {
                        recorderDegrees = cameraDirection == Camera.CameraInfo.CAMERA_FACING_FRONT ? 90 : 270;
                    }
                } else if (event.values[1] < 4 && event.values[1] > -4) {
                    if (event.values[0] > 0) {
                        recorderDegrees = 0;
                    } else if (event.values[0] < 0) {
                        recorderDegrees = 180;
                    }
                }
            }
        }
        @Override
        public void onAccuracyChanged(Sensor sensor, int accuracy) {
        }
    };

}