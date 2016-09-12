package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.tasks.DownloadImageTask;

public class ImageEditFragment extends Fragment {
    private static final int SELECT_PHOTO = 1;

    private ImageView mImageView;
    private TextView mImageMessage;
    private ProgressBar mImageProgress;
    private Button mChangeImageButton;
    private Button mDeleteImageButton;
    private DownloadImageTask mDownloadImageTask;
    private ImageEditFragmentListener mListener = null;

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
        mImageMessage = (TextView) view.findViewById(R.id.no_image);
        mImageMessage.setVisibility(View.INVISIBLE);
        mImageProgress = (ProgressBar) view.findViewById(R.id.image_progress);
        mChangeImageButton = (Button) view.findViewById(R.id.change_image_button);
        mChangeImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
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
        mDeleteImageButton.setVisibility(View.INVISIBLE);
        mDeleteImageButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mDownloadImageTask != null) {
                    mDownloadImageTask.cancel(true);
                    mDownloadImageTask = null;
                }
                if (mListener != null)
                    mListener.onDelete();
            }
        });

        load(null);

        return view;
    }

    public void load(Uri uri) {
        load(uri, null, getString(R.string.no_image), 1.0f);
    }

    public void load(final Uri uri, Uri noImageUri, String noImageMessage, float noImageAlpha) {
        mImageMessage.setText(noImageMessage);
        if (uri == null) {
            mImageView.setImageResource(R.drawable.no_img);
            mDeleteImageButton.setVisibility(View.GONE);
        } else {
            mDeleteImageButton.setVisibility(View.VISIBLE);
        }

        Uri downloadUri = uri;
        if (downloadUri == null)
            downloadUri = noImageUri;

        if (downloadUri == null) {
            mImageProgress.setVisibility(View.INVISIBLE);
            mImageView.setImageResource(R.drawable.no_img);
        } else {
            mImageProgress.setVisibility(View.VISIBLE);
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
                    if (mListener != null)
                        mListener.onChange(imageReturnedIntent.getData());
                }
        }
    }

    public interface ImageEditFragmentListener {
        void onDelete();
        void onChange(Uri image);
    }

    public void setListener(ImageEditFragmentListener mListener) {
        this.mListener = mListener;
    }
}
