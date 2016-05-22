package com.myjobpitch.activities;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Matrix;
import android.graphics.SurfaceTexture;
import android.hardware.Camera;
import android.media.CamcorderProfile;
import android.media.MediaRecorder;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.view.MenuItem;
import android.view.Surface;
import android.view.SurfaceHolder;
import android.view.TextureView;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.media.CameraHelper;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.List;

public class CameraActivity extends MJPActionBarActivity {
    public static final String OUTPUT_FILE = "output_file";

    private static final int MAX_RECORD_TIME = 30;
    private static final int COUNTDOWN_TIME = 3;

    private final String mOutputFile = CameraHelper.getOutputMediaFile(CameraHelper.MEDIA_TYPE_VIDEO).toString();

    private Camera mCamera;
    private TextureView mPreview;
    private Button mCaptureButton;

    private MediaRecorder mMediaRecorder;
    private CamcorderProfile mProfile;
    private static final String TAG = "CameraActivity";

    private ImageButton mRotateCameraButton;
    private int cameraDirection = Camera.CameraInfo.CAMERA_FACING_BACK;

    private boolean isRecording = false;
    private boolean isActive = false;
    private boolean isBackpressed = false;
    private Object mRecordingLock = new Object();
    private TextView mCountdownView;

    private Boolean camera_face_sel=true;

    int currentCameraId = Camera.CameraInfo.CAMERA_FACING_BACK;
    private SurfaceHolder previewHolder = null;

    private boolean isBack = false;

    public static boolean camera_direction = false;

    private class CountDownAction implements Runnable {
        private final View view;
        private Integer count;
        private Runnable onTickAction;
        private Runnable onCompleteAction;
        private Runnable onCancelAction;

        public CountDownAction(Integer count, View view) {
            this.count = count;
            this.view = view;
        }

        public void onTick(Runnable action) {
            this.onTickAction = action;
        }

        public void onComplete(Runnable action) {
            this.onCompleteAction = action;
        }

        public void onCancel(Runnable action) {
            this.onCancelAction = action;
        }

        @Override
        public void run() {
            synchronized (mRecordingLock) {
                if (isActive) {
                    if (count <= 0) {
                        onCompleteAction.run();
                    } else {
                        onTickAction.run();
                        view.postDelayed(this, 1000);
                    }
                    count--;
                 } else {
                    onCancelAction.run();
                }
            }
        }

        public Integer getCount() {
            return count;
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (savedInstanceState != null && savedInstanceState.containsKey("cameraDirection"))
            cameraDirection = savedInstanceState.getInt("cameraDirection", Camera.CameraInfo.CAMERA_FACING_FRONT);

        setContentView(R.layout.activity_camera);

        mCountdownView = (TextView) findViewById(R.id.countdown);

        mPreview = (TextureView) findViewById(R.id.camera_preview);
        mPreview.setSurfaceTextureListener(new TextureView.SurfaceTextureListener() {
            @Override
            public void onSurfaceTextureAvailable(SurfaceTexture surface, int width, int height) {
                Log.d("CameraActivity", "onSurfaceTextureAvailable");
                StartPreviewTask startPreviewTask = new StartPreviewTask();
                startPreviewTask.execute();
            }

            @Override
            public void onSurfaceTextureSizeChanged(SurfaceTexture surface, int width, int height) {
                Log.d("CameraActivity", "onSurfaceTextureSizeChanged");
            }

            @Override
            public boolean onSurfaceTextureDestroyed(SurfaceTexture surface) {
                Log.d("CameraActivity", "onSurfaceTextureDestroyed");
                return false;
            }

            @Override
            public void onSurfaceTextureUpdated(SurfaceTexture surface) {}
        });



        mCaptureButton = (Button) findViewById(R.id.record_button);
        mCaptureButton.setEnabled(false);
        mCaptureButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(final View v) {
                synchronized (mRecordingLock) {
                    if (isActive) {
                        if (isRecording) {
                            stopRecording();
                        }
                        isRecording = false;
                        isActive = false;
                        isBack = true;

                    } else {
                        isBackpressed = true;
                        AlertDialog.Builder builder = new AlertDialog.Builder(CameraActivity.this);
                        builder.setMessage(getString(R.string.pre_record_message, COUNTDOWN_TIME, MAX_RECORD_TIME))
                                .setCancelable(false)
                                .setPositiveButton(getString(R.string.record), new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int id) {
                                        dialog.cancel();
                                        synchronized (mRecordingLock) {
                                            if (isActive)
                                                return; // This shouldn't ever happen...
                                            isActive = true;
                                            isBack = false;
                                            setCaptureButtonText(getString(R.string.get_ready));
                                            mCountdownView.setVisibility(View.VISIBLE);
                                            mRotateCameraButton.setEnabled(false);
                                            final CountDownAction countDown = new CountDownAction(COUNTDOWN_TIME, v);
                                            countDown.onTick(new Runnable() {
                                                @Override
                                                public void run() {
                                                    mCountdownView.setText(countDown.getCount().toString());
                                                }
                                            });
                                            countDown.onComplete(new Runnable() {
                                                @Override
                                                public void run() {
                                                    isBackpressed = false;
                                                    mCamera.stopPreview();
                                                    isRecording = true;
                                                    //stopRecording();
                                                    //releaseMediaRecorder();
                                                    //prepareMediaRecorder1();
                                                    new StartRecordingTask().execute(null, null, null);

                                                }
                                            });
                                            countDown.onCancel(new Runnable() {
                                                @Override
                                                public void run() {
                                                    mCountdownView.setVisibility(View.INVISIBLE);
                                                    mRotateCameraButton.setEnabled(true);
                                                    setCaptureButtonText(getString(R.string.record));
                                                }
                                            });
                                            countDown.run();
                                        }
                                    }
                                })
                                .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                                    public void onClick(DialogInterface dialog, int id) {
                                        dialog.cancel();
                                    }
                                }).create().show();
                    }
                }
            }
        });

        mRotateCameraButton = (ImageButton) findViewById(R.id.rotate_camera_button);
        mRotateCameraButton.setEnabled(false);
        if (Camera.getNumberOfCameras() == 1)
            mRotateCameraButton.setVisibility(View.GONE);
        mRotateCameraButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                if (camera_face_sel==false) {
                    mCamera.stopPreview();
                    camera_face_sel =  true;
                }else {
                    camera_face_sel = false;
                    mCamera.release();

                    //swap the id of the camera to be used
                    if (currentCameraId == Camera.CameraInfo.CAMERA_FACING_BACK) {
                        currentCameraId = Camera.CameraInfo.CAMERA_FACING_FRONT;
                    } else {
                        currentCameraId = Camera.CameraInfo.CAMERA_FACING_BACK;
                    }
                    mCamera = Camera.open(currentCameraId);

                    setCameraDisplayOrientation(CameraActivity.this, currentCameraId, mCamera);
                    try {

                        mCamera.setPreviewTexture(mPreview.getSurfaceTexture());
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                    mCamera.startPreview();
                }

            }
        });
    }


    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putInt("cameraDirection", cameraDirection);
    }

    private void stopRecording() {
        // stop recording and release camera
        try {
            if (mMediaRecorder != null)
                mMediaRecorder.stop();  // stop the recording
        } catch (Exception e) {}
        releaseMediaRecorder(); // release the MediaRecorder object
        //mCamera.lock();         // take camera access back from MediaRecorder
        setCaptureButtonText(getString(R.string.record));

        Intent intent = new Intent();
        intent.putExtra(OUTPUT_FILE, mOutputFile);
        setResult(Activity.RESULT_OK, intent);
        finish();
    }

    private void toggleCamera() {
        if (cameraDirection == Camera.CameraInfo.CAMERA_FACING_BACK)
            cameraDirection = Camera.CameraInfo.CAMERA_FACING_FRONT;
        else
            cameraDirection = Camera.CameraInfo.CAMERA_FACING_BACK;
    }

    private int getCurrentCameraId() {
        int numberOfCameras = Camera.getNumberOfCameras();
        for (int i = 0; i < numberOfCameras; i++) {
            Camera.CameraInfo info = new Camera.CameraInfo();
            Camera.getCameraInfo(i, info);
            if (info.facing == cameraDirection) {
                return i;
            }
        }
        return -1;
    }


    private void setCaptureButtonText(String title) {
        mCaptureButton.setText(title);
    }

    private void adjustAspectRatio(int videoWidth, int videoHeight) {
        int previewWidth = 0;
        int previewHeight = 0;


        int viewWidth = mPreview.getWidth();
        int viewHeight = mPreview.getHeight();
        double aspectRatio = (double) videoHeight / videoWidth;

        int newWidth, newHeight;
        if (viewHeight > (int) (viewWidth * aspectRatio)) {
            // limited by narrow width; restrict height
            newWidth = viewWidth;
            newHeight = (int) (viewWidth * aspectRatio);
        } else {
            // limited by short height; restrict width
            newWidth = (int) (viewHeight / aspectRatio);
            newHeight = viewHeight;
        }
        int xoff = (viewWidth - newWidth) / 2;
        int yoff = (viewHeight - newHeight) / 2;
        Log.d(TAG, "video=" + videoWidth + "x" + videoHeight +
                " view=" + viewWidth + "x" + viewHeight +
                " newView=" + newWidth + "x" + newHeight +
                " off=" + xoff + "," + yoff);

        Matrix txform = new Matrix();
        mPreview.getTransform(txform);
        txform.setScale((float) newWidth / viewWidth, (float) newHeight / viewHeight);
        txform.postTranslate(xoff, yoff);
        mPreview.setTransform(txform);
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        // if we are using MediaRecorder, release it first
        releaseMediaRecorder();
        // release the camera immediately on pause event
        releaseCamera();
    }

    @Override
    public void onBackPressed()
    {
        // code here to show dialog
        if (isBackpressed){
            return;
        }
        super.onBackPressed();  // optional depending on your needs
        if (mOutputFile != null) {
            AlertDialog.Builder builder = new AlertDialog.Builder(CameraActivity.this);
            builder.setMessage(getString(R.string.discard_recording_prompt))
                    .setCancelable(false)
                    .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.cancel();
                            finish();
                        }
                    })
                    .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                        public void onClick(DialogInterface dialog, int id) {
                            dialog.cancel();
                        }
                    }).create().show();
        } else
            finish();

    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case android.R.id.home:
                onBackPressed();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void releaseMediaRecorder() {
        if (mMediaRecorder != null) {
            // clear recorder configuration
            mMediaRecorder.reset();
            // release the recorder object
            mMediaRecorder.release();
            mMediaRecorder = null;
            // Lock camera for later use i.e taking it back from MediaRecorder.
            // MediaRecorder doesn't need it anymore and we will release it if the activity pauses.
            mCamera.lock();
        }
    }

    private void releaseCamera(){
        if (mCamera != null){
            // release the camera for other applications
            mCamera.release();
            mCamera = null;
        }
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    private boolean prepareMediaRecorder(){



        android.hardware.Camera.CameraInfo info =
                new android.hardware.Camera.CameraInfo();
        mMediaRecorder = new MediaRecorder();

        // Step 1: Unlock and set camera to MediaRecorder
        if (info.facing == Camera.CameraInfo.CAMERA_FACING_BACK) {
           //mCamera.setDisplayOrientation(90);
            camera_direction = true;
        }
        //mCamera.setDisplayOrientation(90);

        mCamera.unlock();
        mMediaRecorder.setCamera(mCamera);

        // Step 2: Set sources




        mMediaRecorder.setAudioSource(MediaRecorder.AudioSource.CAMCORDER);
        mMediaRecorder.setVideoSource(MediaRecorder.VideoSource.CAMERA);

        // Step 3: Set a CamcorderProfile (requires API Level 8 or higher)
        mMediaRecorder.setProfile(mProfile);


        // Step 4: Set output file
        mMediaRecorder.setOutputFile(mOutputFile);

        // Step 5: Prepare configured MediaRecorder
       // mMediaRecorder.setOrientationHint(90);

//        if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
//            mMediaRecorder.setOrientationHint(0);
//        } else {  // back-facing
//            mMediaRecorder.setOrientationHint(90);
//        }

        if (currentCameraId == Camera.CameraInfo.CAMERA_FACING_FRONT) {

            mMediaRecorder.setOrientationHint(270);
        }
        if (currentCameraId == Camera.CameraInfo.CAMERA_FACING_BACK) {
            mMediaRecorder.setOrientationHint(90);
        }


        try {
            mMediaRecorder.prepare();
        } catch (IllegalStateException e) {
            Log.d(TAG, "IllegalStateException preparing MediaRecorder: " + e.getMessage());
            releaseMediaRecorder();
            return false;
        } catch (IOException e) {
            Log.d(TAG, "IOException preparing MediaRecorder: " + e.getMessage());
            releaseMediaRecorder();
            return false;
        }
        return true;
    }




    public static void setCameraDisplayOrientation(Activity activity, int cameraId, android.hardware.Camera camera) {
        android.hardware.Camera.CameraInfo info =
                new android.hardware.Camera.CameraInfo();
        android.hardware.Camera.getCameraInfo(cameraId, info);
        int rotation = activity.getWindowManager().getDefaultDisplay().getRotation();
        int degrees = 0;
        switch (rotation) {
            case Surface.ROTATION_0: degrees = 0; break;
            case Surface.ROTATION_90: degrees = 90; break;
            case Surface.ROTATION_180: degrees = 180; break;
            case Surface.ROTATION_270: degrees = 270; break;
        }

        int result;
        if (info.facing == Camera.CameraInfo.CAMERA_FACING_FRONT) {
            result = (info.orientation + degrees + 180) % 360;
            //result = (360 - result) % 360;  // compensate the mirror
        } else {  // back-facing
            result = (info.orientation - degrees + 360) % 360;
        }
        camera.setDisplayOrientation(result);
    }

    /**
     * Asynchronous task for preparing the {@link android.media.MediaRecorder} since it's a long blocking
     * operation.
     */
    public class StartPreviewTask extends AsyncTask<Void, Void, Boolean> {

        @Override
        protected Boolean doInBackground(Void... voids) {
            //Log.d("CameraActivity", "Starting Preview: do in background");
            mCamera = CameraHelper.getDefaultCamera(cameraDirection);

            if (mCamera == null) {
                toggleCamera();
                mCamera = CameraHelper.getDefaultCamera(cameraDirection);
            }

            if (mCamera == null)
                return false;

            mCamera.lock();
            setCameraDisplayOrientation(CameraActivity.this, getCurrentCameraId(), mCamera);


            // We need to make sure that our preview and recording video size are supported by the
            // camera. Query camera to find all the sizes and choose the optimal size given the
            // dimensions of our preview surface.
            Camera.Parameters parameters = mCamera.getParameters();
            List<Camera.Size> mSupportedPreviewSizes = parameters.getSupportedPreviewSizes();
            Camera.Size optimalSize = CameraHelper.getOptimalPreviewSize(mSupportedPreviewSizes,
                    mPreview.getWidth(), mPreview.getHeight());
            Log.d("CameraActivity", "preview size: " + mPreview.getWidth() + " x " + mPreview.getHeight());
            // Use the same size for recording profile.
            mProfile = CamcorderProfile.get(CamcorderProfile.QUALITY_HIGH);
            mProfile.videoFrameWidth = optimalSize.width;
            mProfile.videoFrameHeight = optimalSize.height;
            Log.d("CameraActivity", "mProfile size: " + mProfile.videoFrameWidth + " x " + mProfile.videoFrameHeight);

            // likewise for the camera object itself.
            parameters.setPreviewSize(mProfile.videoFrameWidth, mProfile.videoFrameHeight);
            mCamera.setParameters(parameters);
            try {
                mCamera.setPreviewTexture(mPreview.getSurfaceTexture());
            } catch (IOException e) {
                Log.e(TAG, "Surface texture is unavailable or unsuitable" + e.getMessage());
                return false;
            }
            return true;
        }

        @Override
        protected void onPostExecute(Boolean result) {
            Log.d("CameraActivity", "Starting Preview: post execute result = " + result);
            if (result) {
                adjustAspectRatio(mProfile.videoFrameWidth, mProfile.videoFrameHeight);
                mCamera.startPreview();
                mCaptureButton.setEnabled(true);
                mRotateCameraButton.setEnabled(true);
            } else
                CameraActivity.this.finish();
        }

        @Override
        protected void onPreExecute() {
        }

        @Override
        protected void onProgressUpdate(Void... values) {
        }

    }

    /**
     * Asynchronous task for preparing the {@link android.media.MediaRecorder} since it's a long blocking
     * operation.
     */
    private class StartRecordingTask extends AsyncTask<Void, Void, Boolean> {

        @Override
        protected Boolean doInBackground(Void... voids) {
            // initialize video camera
            if (prepareMediaRecorder()) {
                // Camera is available and unlocked, MediaRecorder is prepared,
                // now you can start recording
                return true;
            } else {
                // prepare didn't work, release the camera
                releaseMediaRecorder();
                return false;
            }
        }

        @Override
        protected void onPostExecute(Boolean result) {
            if (result) {
                mMediaRecorder.start();
                setCaptureButtonText(getString(R.string.stop));
                final CountDownAction countDown = new CountDownAction(MAX_RECORD_TIME, mCountdownView);
                countDown.onTick(new Runnable() {
                    @Override
                    public void run() {
                        mCountdownView.setTextColor(getResources().getColor(android.R.color.holo_red_dark));
                        mCountdownView.setText(countDown.getCount().toString());
                    }
                });
                countDown.onComplete(new Runnable() {
                    @Override
                    public void run() {
                        stopRecording();
                    }
                });
                countDown.onCancel(new Runnable() {
                    @Override
                    public void run() {
                        setCaptureButtonText(getString(R.string.record));
                    }
                });
                countDown.run();
            } else {
                CameraActivity.this.finish();
            }
        }

        @Override
        protected void onPreExecute() {
        }

        @Override
        protected void onProgressUpdate(Void... values) {
        }

    }

}