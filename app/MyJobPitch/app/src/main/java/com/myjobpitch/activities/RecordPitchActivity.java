package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.net.Uri;
import android.os.Bundle;
import android.provider.MediaStore;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.uploader.PitchUploader;
import com.myjobpitch.uploader.UploadInProgressCallback;

import java.io.File;
import java.io.IOException;

public class RecordPitchActivity extends MJPProgressActionBarActivity implements PitchUploadListener {
    private static final String TAG = "RecordPitchActivity";

    public void onStateChange(int state) {
        switch (state) {
            case PitchUpload.STARTING:
                Log.d(TAG, "onStateChange(STARTING)");
                mProgressText.setText(getString(R.string.starting_upload));
                showProgress(true);
                break;
            case PitchUpload.UPLOADING:
                Log.d(TAG, "onStateChange(STARTING)");
                showProgress(false);
                showUploadProgress(true);
                mUploadProgressBar.setIndeterminate(true);
                mUploadProgressText.setText("0%");
                break;
            case PitchUpload.PROCESSING:
                Log.d(TAG, "onStateChange(PROCESSING)");
                mUploadProgressText.setText(getString(R.string.processing));
                mUploadProgressBar.setIndeterminate(true);
                break;
            case PitchUpload.COMPLETE:
                Log.d(TAG, "onStateChange(COMPLETE)");
                showUploadProgress(false);
                showProgress(false);
                Toast.makeText(RecordPitchActivity.this, "Pitch successfully uploaded!", Toast.LENGTH_LONG).show();
                finish();
                break;
        }
    }

    @Override
    public void onProgress(double current, long total) {
        int complete = (int)(((float) current / total) * 100);
        Log.d(TAG, "onProgress(" + complete + "%)");
        mUploadProgressBar.setIndeterminate(false);
        mUploadProgressBar.setProgress(complete);
        mUploadProgressText.setText(Integer.toString(complete) + "%");
    }

    @Override
    public void onError(String message) {
        showUploadProgress(false);
        showProgress(false);
        Toast.makeText(RecordPitchActivity.this, "Error uploading video!", Toast.LENGTH_LONG).show();
    }


    private static final int RECORD_PITCH = 1;
    private static final String OUTPUT_FILE = "output_file";

    private PitchUploader mPitchUploader;
    private String mOutputFile = null;
    private Button mUploadButton;
    private Bitmap mPreviewBitmap;
    private ImageView mPreviewImageView;
    private ProgressBar mImageProgress;
    private ImageButton mPlayButton;
    private View mNoRecordingView;
    private View mProgressView;
    private TextView mProgressText;
    private View mUploadProgressView;
    private TextView mUploadProgressText;
    private ProgressBar mUploadProgressBar;
    private Pitch mPitch;
    private DownloadImageTask mDownloadImageTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mPitchUploader = new AWSPitchUploader(getApplicationContext(), getApi());

        if (savedInstanceState != null && savedInstanceState.containsKey(OUTPUT_FILE))
            mOutputFile = savedInstanceState.getString(OUTPUT_FILE);

        if (getIntent().hasExtra("pitch_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                mPitch = mapper.readValue(getIntent().getStringExtra("pitch_data"), Pitch.class);
            } catch (IOException e) {}
        }

        setContentView(R.layout.activity_record_pitch);

        Button recordPitchButton = (Button) findViewById(R.id.record_pitch_button);
        recordPitchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mOutputFile != null || mUploadProgressView.getVisibility() == View.VISIBLE) {
                    String message;
                    if (mUploadProgressView.getVisibility() == View.VISIBLE)
                        message = getString(R.string.cancel_upload_prompt);
                    else
                        message = getString(R.string.start_recording_prompt);
                    AlertDialog.Builder builder = new AlertDialog.Builder(RecordPitchActivity.this);
                    builder.setMessage(message)
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    startActivityForResult(new Intent(RecordPitchActivity.this, CameraActivity.class), RECORD_PITCH);
                                }
                            })
                            .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                }
                            }).create().show();
                } else {
                    startActivityForResult(new Intent(RecordPitchActivity.this, CameraActivity.class), RECORD_PITCH);
                }
            }
        });

        mUploadButton = (Button) findViewById(R.id.upload_button);
        mUploadButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mUploadProgressView.getVisibility() == View.VISIBLE) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(RecordPitchActivity.this);
                    builder.setMessage(getString(R.string.cancel_upload_prompt))
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    doUpload();
                                }
                            })
                            .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                }
                            }).create().show();
                } else
                    doUpload();
            }
        });

        mPlayButton = (ImageButton) findViewById(R.id.play_button);
        mPlayButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String video;
                if (mOutputFile != null)
                    video = Uri.fromFile(new File(mOutputFile)).toString();
                else
                    video = mPitch.getVideo();
                Log.d("RecordPitchActivity", "playing video " + video);
                Intent intent = new Intent(RecordPitchActivity.this, MediaPlayerActivity.class);
                intent.putExtra("url", video);
                startActivity(intent);
            }
        });

        mPreviewImageView = (ImageView) findViewById(R.id.image_preview);
        mImageProgress = (ProgressBar) findViewById(R.id.image_progress);
        mNoRecordingView = findViewById(R.id.no_recording);

        mProgressView = findViewById(R.id.progress);
        mProgressText = (TextView) findViewById(R.id.progress_text);

        mUploadProgressView = findViewById(R.id.upload_progress);
        mUploadProgressText = (TextView) findViewById(R.id.upload_progress_text);
        mUploadProgressBar = (ProgressBar) findViewById(R.id.upload_progress_bar);
        updateInterface();

        showProgress(true);
        mPitchUploader.getUploadInProgress(new UploadInProgressCallback() {
            @Override
            public void uploadInProgress(PitchUpload upload) {
                upload.setPitchUploadListener(RecordPitchActivity.this);
            }

            @Override
            public void noUploadInProgress() {
                showProgress(false);
            }

            @Override
            public void error() {
                Toast.makeText(RecordPitchActivity.this, "Error: Couldn't get video upload state!", Toast.LENGTH_LONG).show();
                finish();
            }
        });
    }

    private void doUpload() {
        showProgress(true);
        PitchUpload upload = mPitchUploader.upload(new File(mOutputFile));
        upload.setPitchUploadListener(this);
        upload.start();
    }

    private void showUploadProgress(boolean visible) {
        if (visible) {
            mUploadProgressBar.setIndeterminate(false);
            mUploadProgressView.setVisibility(View.VISIBLE);
        } else
            mUploadProgressView.setVisibility(View.GONE);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (mOutputFile != null)
            outState.putString(OUTPUT_FILE, mOutputFile);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == RECORD_PITCH && resultCode == RESULT_OK) {
            if (mDownloadImageTask != null)
                mDownloadImageTask.cancel(true);
            mImageProgress.setVisibility(View.INVISIBLE);
            mOutputFile = data.getStringExtra(CameraActivity.OUTPUT_FILE);
            updateInterface();
        }
    }

    private void updateInterface() {
        int uploadButtonVisibility = View.GONE;
        int noRecordingVisibility = View.INVISIBLE;
        int playButtonVisibility = View.GONE;

        if (mOutputFile != null) {
            uploadButtonVisibility = View.VISIBLE;
            playButtonVisibility = View.VISIBLE;
            mPreviewBitmap = ThumbnailUtils.createVideoThumbnail(mOutputFile, MediaStore.Images.Thumbnails.FULL_SCREEN_KIND);
        } else if (mPitch != null) {
            playButtonVisibility = View.VISIBLE;
            Uri uri = Uri.parse(mPitch.getImage());
            mImageProgress.setVisibility(View.VISIBLE);
            mDownloadImageTask = new DownloadImageTask(this, mPreviewImageView, mImageProgress);
            mDownloadImageTask.execute(uri);
        } else {
            noRecordingVisibility = View.VISIBLE;
        }

        if (mPreviewBitmap != null)
            mPreviewImageView.setImageBitmap(mPreviewBitmap);
        mPlayButton.setVisibility(playButtonVisibility);
        mUploadButton.setVisibility(uploadButtonVisibility);
        mNoRecordingView.setVisibility(noRecordingVisibility);
    }

    @Override
    public void onBackPressed() {
        if (mOutputFile != null) {
            AlertDialog.Builder builder = new AlertDialog.Builder(RecordPitchActivity.this);
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

    @Override
    public View getMainView() {
        return findViewById(R.id.record_form);
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }
}
