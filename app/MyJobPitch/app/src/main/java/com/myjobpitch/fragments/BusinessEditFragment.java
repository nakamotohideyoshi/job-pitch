package com.myjobpitch.fragments;

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

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static BusinessEditFragment newInstance() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public BusinessEditFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
//            mParam1 = getArguments().getString(ARG_PARAM1);
//            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_business_edit, container, false);

        mNameView = (EditText) view.findViewById(R.id.business_name);

        Map<String, View> fields = new HashMap<>();
        fields.put("name", mNameView);
        setFields(fields);
        setRequiredFields(fields.values());
        return view;
    }
    public void load(Business business) {
        mNameView.setText(business.getName());
    }

    public void save(Business business) {
        business.setName(mNameView.getText().toString());
    }
}
