package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.media.ThumbnailUtils;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
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
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.UploadPitch;

import java.io.File;
import java.io.IOException;

public class RecordPitchActivity extends MJPProgressActionBarActivity {
    private static final int RECORD_PITCH = 1;
    private static final String OUTPUT_FILE = "output_file";

    private String mOutputFile = null;
    private Button mUploadButton;
    private Bitmap mPreviewBitmap;
    private ImageView mPreviewImageView;
    private ProgressBar mImageProgress;
    private ImageButton mPlayButton;
    private View mNoRecordingView;
    private View mProgressView;
    private TextView mProgressText;
    private Pitch mPitch;
    private DownloadImageTask mDownloadImageTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
                if (mOutputFile != null) {
                    AlertDialog.Builder builder = new AlertDialog.Builder(RecordPitchActivity.this);
                    builder.setMessage(getString(R.string.start_recording_prompt))
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
                showProgress(true);
                mProgressText.setText(getString(R.string.uploading, 0));
                UploadPitch uploadTask = new UploadPitch(RecordPitchActivity.this, getApi(), mOutputFile, new UploadPitch.ProgressListener() {
                    int complete = 0;

                    @Override
                    public void transferred(long transferred, long totalSize) {
                        int newValue = Math.round((((float)transferred)/totalSize)*100);
                        if (newValue != complete) {
                            complete = newValue;
                            new Handler(Looper.getMainLooper()).post(new Runnable() {
                                @Override
                                public void run() {
                                    if (complete < 100)
                                        mProgressText.setText(getString(R.string.uploading, complete));
                                    else
                                        mProgressText.setText(getString(R.string.processing));
                                }
                            });
                        }
                    }
                });
                uploadTask.addListener(new APITaskListener<Boolean>() {
                    @Override
                    public void onPostExecute(Boolean success) {
                        if (success) {
                            Toast toast = Toast.makeText(RecordPitchActivity.this, "Pitch uploaded!", Toast.LENGTH_LONG);
                            toast.show();
                            finish();
                        } else {
                            Toast toast = Toast.makeText(RecordPitchActivity.this, "Error uploading video!", Toast.LENGTH_LONG);
                            toast.show();
                            showProgress(false);
                        }
                    }

                    @Override
                    public void onCancelled() {
                        Toast toast = Toast.makeText(RecordPitchActivity.this, "Error uploading video", Toast.LENGTH_LONG);
                        toast.show();
                        showProgress(false);
                    }
                });
                uploadTask.execute();
            }
        });

        mPlayButton = (ImageButton) findViewById(R.id.play_button);
        mPlayButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String video = null;
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

        updateInterface();
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
            Uri uri = Uri.parse(mPitch.getThumbnail());
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