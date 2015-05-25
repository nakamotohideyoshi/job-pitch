package com.myjobpitch.fragments;

import android.app.Activity;
import android.support.v4.app.Fragment;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.DownloadImageTask;

import java.util.HashMap;
import java.util.Map;

public class ImageEditFragment extends Fragment {
    private static final int SELECT_PHOTO = 1;

    private ImageView mImageView;
    private TextView mNoImageView;
    private ProgressBar mImageProgress;
    private Button mChangeImageButton;
    private AsyncTask<Uri, Void, Bitmap> mDownloadImageTask;
    private Uri mImageUri = null;

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
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_image_edit, container, false);

        mImageView = (ImageView) view.findViewById(R.id.image_preview);
        mNoImageView = (TextView) view.findViewById(R.id.no_image);
        mImageProgress = (ProgressBar) view.findViewById(R.id.image_progress);
        mChangeImageButton = (Button) view.findViewById(R.id.change_image_button);
        mChangeImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mDownloadImageTask != null)
                    mDownloadImageTask.cancel(true);
                Intent photoPickerIntent = new Intent(Intent.ACTION_PICK);
                photoPickerIntent.setType("image/*");
                startActivityForResult(photoPickerIntent, SELECT_PHOTO);
            }
        });

        if (savedInstanceState != null && savedInstanceState.containsKey("mImageUri"))
            mImageUri = savedInstanceState.getParcelable("mImageUri");

        return view;
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (mImageUri != null)
            outState.putParcelable("mImageUri", mImageUri);
    }

    public void load(Uri uri) {
        if (mImageUri != null)
            uri = mImageUri;

        if (uri == null) {
            mImageProgress.setVisibility(View.INVISIBLE);
            mNoImageView.setVisibility(View.VISIBLE);
        } else {
            mImageProgress.setVisibility(View.VISIBLE);
            mNoImageView.setVisibility(View.INVISIBLE);
            mDownloadImageTask = new DownloadImageTask(getActivity(), mImageView, mImageProgress).execute(uri);
        }
    }

    public Uri getNewImageUri() {
        return mImageUri;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent) {
        super.onActivityResult(requestCode, resultCode, imageReturnedIntent);
        Log.d("ImageEditFragment", "Got result");
        switch (requestCode) {
            case SELECT_PHOTO:
                if (resultCode == Activity.RESULT_OK) {
                    mImageUri = imageReturnedIntent.getData();
                    Log.d("ImageEditFragment", "Got image URI: " + mImageUri);
                    mDownloadImageTask = new DownloadImageTask(getActivity(), mImageView, mImageProgress).execute(mImageUri);
                }
        }
    }
}
