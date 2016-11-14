package com.myjobpitch.fragments;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;

import java.util.HashMap;
import java.util.Map;

public class BusinessEditFragment extends EditFragment<Business> {

    private EditText mNameView;
    private ImageEditFragment mImageEdit;
    private Business mBusiness;
    private Uri mImageUri;
    private boolean mImageUriSet = false;

    public BusinessEditFragment() {
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
        View view = inflater.inflate(R.layout.fragment_business_edit, container, false);

        mNameView = (EditText) view.findViewById(R.id.business_name);
        mImageEdit = (ImageEditFragment) getChildFragmentManager().findFragmentById(R.id.image_edit_fragment);
        mImageEdit.setListener(new ImageEditFragment.ImageEditFragmentListener() {
            @Override
            public void onDelete() {
                AlertDialog.Builder builder = new AlertDialog.Builder(BusinessEditFragment.this.getActivity());
                builder.setMessage(getString(R.string.delete_image_confirmation))
                        .setCancelable(false)
                        .setPositiveButton(getString(R.string.delete), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                                mImageUri = null;
                                loadImage();
                            }
                        })
                        .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                            public void onClick(DialogInterface dialog, int id) {
                                dialog.cancel();
                            }
                        }).create().show();
            }

            @Override
            public void onChange(Uri image) {
                mImageUri = image;
                loadImage();
            }
        });
        Map<String, View> fields = new HashMap<>();
        fields.put("name", mNameView);
        setFields(fields);
        setRequiredFields(fields.values());

        if (savedInstanceState != null && savedInstanceState.containsKey("mImageUri")) {
            mImageUri = savedInstanceState.getParcelable("mImageUri");
            mImageUriSet = true;
        }

        return view;
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        outState.putParcelable("mImageUri", mImageUri);
    }

    public void load(Business business) {
        mBusiness = business;
        mNameView.setText(business.getName());
        if (!mImageUriSet && mBusiness.getImages() != null && !mBusiness.getImages().isEmpty())
            mImageUri = Uri.parse(mBusiness.getImages().get(0).getThumbnail());
        loadImage();
    }

    private void loadImage() {
        mImageEdit.load(mImageUri);
        if (mImageUri == null) {
            mImageEdit.mImageView.setImageResource(R.drawable.default_logo);
        }
    }

    public void save(Business business) {
        business.setName(mNameView.getText().toString());
    }

    public Uri getImageUri() {
        return mImageUri;
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent) {
        super.onActivityResult(requestCode, resultCode, imageReturnedIntent);
        mImageEdit.onActivityResult(requestCode, resultCode, imageReturnedIntent);
    }
}
