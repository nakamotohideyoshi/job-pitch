package com.myjobpitch.fragments;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.widgets.MJPObjectWithNameAdapter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobEditFragment extends EditFragment {
    private EditText mLocationTitleView;
    private EditText mLocationDescView;
    private Spinner mLocationSectorView;
    private Spinner mLocationContractView;
    private Spinner mLocationHoursView;
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;
    private ImageEditFragment mImageEdit;
    private TextView mLocationDescCharacters;
    private Uri mImageUri;
    private Uri mNoImageUri;
    private boolean mImageUriSet = false;
    private String mNoImageMessage;
    private float mNoImageAlpha;
    private Job mJob;

    public JobEditFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_job_edit, container, false);
        mImageEdit = (ImageEditFragment) getChildFragmentManager().findFragmentById(R.id.image_edit_fragment);
        mImageEdit.setListener(new ImageEditFragment.ImageEditFragmentListener() {
            @Override
            public void onDelete() {
                AlertDialog.Builder builder = new AlertDialog.Builder(JobEditFragment.this.getActivity());
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

        mLocationTitleView = (EditText) view.findViewById(R.id.job_title);
        mLocationDescView = (EditText) view.findViewById(R.id.job_description);
        mLocationDescCharacters = (TextView) view.findViewById(R.id.job_description_character_count);
        mLocationSectorView = (Spinner) view.findViewById(R.id.job_sector);
        mLocationContractView = (Spinner) view.findViewById(R.id.job_contract);
        mLocationHoursView = (Spinner) view.findViewById(R.id.job_hours);

        mLocationDescView.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                mLocationDescCharacters.setText(getString(R.string.characters_remaining, 500 - charSequence.length()));
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });

        Map<String, View> fields = new HashMap<>();
        fields.put("title", mLocationTitleView);
        fields.put("description", mLocationDescView);
        fields.put("sector", mLocationSectorView);
        fields.put("contract", mLocationContractView);
        fields.put("hours", mLocationHoursView);
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

    public void loadApplicationData(MJPApplication application) {
        this.sectors = application.get(Sector.class);
        mLocationSectorView.setAdapter(new MJPObjectWithNameAdapter(this.getActivity(), android.R.layout.simple_list_item_1, this.sectors));
        this.contracts = application.get(Contract.class);
        mLocationContractView.setAdapter(new MJPObjectWithNameAdapter<>(this.getActivity(), android.R.layout.simple_list_item_1, this.contracts));
        this.hours = application.get(Hours.class);
        mLocationHoursView.setAdapter(new MJPObjectWithNameAdapter<>(this.getActivity(), android.R.layout.simple_list_item_1, this.hours));
    }

    public void load(Job job) {
        mJob = job;
        mLocationTitleView.setText(mJob.getTitle());
        mLocationDescView.setText(mJob.getDescription());
        if (mJob.getSector() != null) {
            for (int i = 0; i < sectors.size(); i++) {
                if (sectors.get(i).getId() == mJob.getSector()) {
                    mLocationSectorView.setSelection(i);
                    break;
                }
            }
        }

        if (mJob.getContract() != null) {
            for (int i = 0; i < contracts.size(); i++) {
                if (contracts.get(i).getId() == mJob.getContract()) {
                    mLocationContractView.setSelection(i);
                    break;
                }
            }
        }

        if (mJob.getHours() != null) {
            for (int i = 0; i < hours.size(); i++) {
                if (hours.get(i).getId() == mJob.getHours()) {
                    mLocationHoursView.setSelection(i);
                    break;
                }
            }
        }

        if (!mImageUriSet && mJob.getImages() != null && !mJob.getImages().isEmpty())
            mImageUri = Uri.parse(mJob.getImages().get(0).getThumbnail());


        mNoImageMessage = getString(R.string.no_image);
        mNoImageAlpha = 1.0f;
        Location location = mJob.getLocation_data();
        if (location != null) {
            if (location.getImages() != null && !location.getImages().isEmpty()) {
                mNoImageUri = Uri.parse(location.getImages().get(0).getThumbnail());
                mNoImageMessage = getString(R.string.image_set_by_location);
                mNoImageAlpha = 0.3f;
            } else {
                Business business = location.getBusiness_data();
                if (business != null && business.getImages() != null && !business.getImages().isEmpty()) {
                    mNoImageUri = Uri.parse(business.getImages().get(0).getThumbnail());
                    mNoImageMessage = getString(R.string.image_set_by_business);
                    mNoImageAlpha = 0.3f;
                }
            }
        }
        loadImage();
    }

    private void loadImage() {
        mImageEdit.load(mImageUri, mNoImageUri, mNoImageMessage, mNoImageAlpha);
    }

    public void save(Job job) {
        job.setTitle(mLocationTitleView.getText().toString());
        job.setDescription(mLocationDescView.getText().toString());

        MJPAPIObject selectedSector = (MJPAPIObject) mLocationSectorView.getSelectedItem();
        if (selectedSector != null)
            job.setSector(selectedSector.getId());
        else
            job.setSector(null);

        MJPAPIObject selectedContract = (MJPAPIObject) mLocationContractView.getSelectedItem();
        if (selectedContract != null)
            job.setContract(selectedContract.getId());
        else
            job.setContract(null);

        MJPAPIObject selectedHours = (MJPAPIObject) mLocationHoursView.getSelectedItem();
        if (selectedHours != null)
            job.setHours(selectedHours.getId());
        else
            job.setHours(null);
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
