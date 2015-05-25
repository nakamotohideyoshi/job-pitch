package com.myjobpitch.fragments;

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

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static BusinessEditFragment newInstance() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        Bundle args = new Bundle();
        fragment.setArguments(args);
        return fragment;
    }

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

        Map<String, View> fields = new HashMap<>();
        fields.put("name", mNameView);
        setFields(fields);
        setRequiredFields(fields.values());
        return view;
    }

    public void load(Business business) {
        mNameView.setText(business.getName());
        if (business.getImages().isEmpty())
            mImageEdit.load(null);
        else
            mImageEdit.load(Uri.parse(business.getImages().get(0).getImage()));
    }

    public void save(Business business) {
        business.setName(mNameView.getText().toString());
    }

    public Uri getNewImageUri() {
        return mImageEdit.getNewImageUri();
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent imageReturnedIntent) {
        super.onActivityResult(requestCode, resultCode, imageReturnedIntent);
        mImageEdit.onActivityResult(requestCode, resultCode, imageReturnedIntent);
    }
}
