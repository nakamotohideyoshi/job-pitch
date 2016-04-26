package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.recruiter.EventForLocationImage;
import com.myjobpitch.utils.Utils;

import org.greenrobot.eventbus.EventBus;

public class ImageEditFragment extends Fragment {
    private static final int SELECT_PHOTO = 1;
    private ImageView mImageView;
    private TextView mImageMessage;
    private ProgressBar mImageProgress;
    private Button mChangeImageButton;
    private Button mDeleteImageButton;
    private DownloadImageTask mDownloadImageTask;
    private ImageEditFragmentListener mListener = null;
    final String TAG = "ImageEditFrag";
    public  boolean isLocation = false;

    public static ImageEditFragment newInstance() {
        ImageEditFragment fragment = new ImageEditFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

    public ImageEditFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Log.i(TAG, "onCreate ");
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_image_edit, container, false);


        mImageView = (ImageView) view.findViewById(R.id.image_preview);
        mImageMessage = (TextView) view.findViewById(R.id.no_image);
        mImageProgress = (ProgressBar) view.findViewById(R.id.image_progress);
        mChangeImageButton = (Button) view.findViewById(R.id.change_image_button);
        mChangeImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Utils.isLocation = isLocation;
                if (mDownloadImageTask != null) {
                    mDownloadImageTask.cancel(true);
                    mDownloadImageTask = null;
                }
                Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
                photoPickerIntent.setType("image/*");
                startActivityForResult(photoPickerIntent, SELECT_PHOTO);
            }
        });

        mDeleteImageButton = (Button) view.findViewById(R.id.delete_image_button);
        mDeleteImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Utils.isLocation = isLocation;
                if (mDownloadImageTask != null) {
                    mDownloadImageTask.cancel(true);
                    mDownloadImageTask = null;
                }
                if (Utils.isLocation){
                    EventBus.getDefault().post(new EventForLocationImage(null));
                }else{
                    if (mListener != null)
                        mListener.onDelete();
                }
            }
        });
        Log.i(TAG, "onCreate View");
        return view;
    }

    public void load(Uri uri) {
        load(uri, null, getString(R.string.no_image), 1.0f);
    }

    public void load(final Uri uri, Uri noImageUri, String noImageMessage, float noImageAlpha) {
        mImageMessage.setText(noImageMessage);
        mImageView.setVisibility(View.INVISIBLE);
        if (uri == null) {
            mImageView.setAlpha(noImageAlpha);
            mDeleteImageButton.setVisibility(View.GONE);
        } else {
            mImageView.setAlpha(1.0f);
            mDeleteImageButton.setVisibility(View.VISIBLE);
        }

        Uri downloadUri = uri;
        if (downloadUri == null)
            downloadUri = noImageUri;

        if (downloadUri == null) {
            mImageProgress.setVisibility(View.INVISIBLE);
            mImageMessage.setVisibility(View.VISIBLE);
        } else {
            mImageProgress.setVisibility(View.VISIBLE);
            mImageMessage.setVisibility(View.INVISIBLE);
            mDownloadImageTask = new DownloadImageTask(getActivity(), mImageView, mImageProgress);
            mDownloadImageTask.setListener(new DownloadImageTask.DownloadImageTaskListener() {
                @Override
                public void onComplete(Bitmap bitmap) {
                    if (uri == null)
                        mImageMessage.setVisibility(View.VISIBLE);
                    mDownloadImageTask = null;
                }

                @Override
                public void onError() {
                    mDownloadImageTask = null;
                }
            });
            mDownloadImageTask.executeOnExecutor(DownloadImageTask.executor, downloadUri);
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent) {
        super.onActivityResult(requestCode, resultCode, imageReturnedIntent);
        switch (requestCode) {
            case SELECT_PHOTO:
                if (resultCode == Activity.RESULT_OK) {
                    Log.i(TAG, "onActivity Result");
                    if (Utils.isLocation){
                        EventBus.getDefault().post(new EventForLocationImage(imageReturnedIntent.getData()));
                    }else{
                        if (mListener != null)
                            mListener.onChange(imageReturnedIntent.getData());
                    }

                }
        }
    }

    public interface ImageEditFragmentListener {
        void onDelete();
        void onChange(Uri image);
    }

    public void setListener(ImageEditFragmentListener mListener) {
        Log.i(TAG, "setListener");
        this.mListener = mListener;
    }
    public void removeListener(){
        this.mListener = null;
    }
}
