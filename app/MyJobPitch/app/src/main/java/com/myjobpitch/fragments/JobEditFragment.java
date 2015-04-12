package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.Spinner;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
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

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static JobEditFragment newInstance() {
        JobEditFragment fragment = new JobEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public JobEditFragment() {
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
        View view = inflater.inflate(R.layout.fragment_job_edit, container, false);

        mLocationTitleView = (EditText) view.findViewById(R.id.job_title);
        mLocationDescView = (EditText) view.findViewById(R.id.job_description);
        mLocationSectorView = (Spinner) view.findViewById(R.id.job_sector);
        mLocationContractView = (Spinner) view.findViewById(R.id.job_contract);
        mLocationHoursView = (Spinner) view.findViewById(R.id.job_hours);

        Map<String, View> fields = new HashMap<>();
        fields.put("title", mLocationTitleView);
        fields.put("description", mLocationDescView);
        fields.put("sector", mLocationSectorView);
        fields.put("contract", mLocationContractView);
        fields.put("hours", mLocationHoursView);
        setFields(fields);

        setRequiredFields(fields.values());

        return view;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sectors = application.get(Sector.class);
        mLocationSectorView.setAdapter(new MJPObjectWithNameAdapter(this.getActivity(), android.R.layout.simple_list_item_1, this.sectors));
        this.contracts = application.get(Contract.class);
        mLocationContractView.setAdapter(new MJPObjectWithNameAdapter<Contract>(this.getActivity(), android.R.layout.simple_list_item_1, this.contracts));
        this.hours = application.get(Hours.class);
        mLocationHoursView.setAdapter(new MJPObjectWithNameAdapter<Hours>(this.getActivity(), android.R.layout.simple_list_item_1, this.hours));
    }

    public void load(Job job) {
        mLocationTitleView.setText(job.getTitle());
        mLocationDescView.setText(job.getDescription());
        if (job.getSector() != null) {
            for (int i = 0; i < sectors.size(); i++) {
                if (sectors.get(i).getId() == job.getSector()) {
                    mLocationSectorView.setSelection(i);
                    break;
                }
            }
        }

        if (job.getContract() != null) {
            for (int i = 0; i < contracts.size(); i++) {
                if (contracts.get(i).getId() == job.getContract()) {
                    mLocationContractView.setSelection(i);
                    break;
                }
            }
        }

        if (job.getHours() != null) {
            for (int i = 0; i < hours.size(); i++) {
                if (hours.get(i).getId() == job.getHours()) {
                    mLocationHoursView.setSelection(i);
                    break;
                }
            }
        }
    }

    public void save(Job job) {
        job.setTitle(mLocationTitleView.getText().toString());
        job.setDescription(mLocationDescView.getText().toString());

        MJPAPIObject selectedSector = (MJPAPIObject) mLocationSectorView.getSelectedItem();
        if (selectedSector != null)
            job.setSector((int) selectedSector.getId());
        else
            job.setSector(null);

        MJPAPIObject selectedContract = (MJPAPIObject) mLocationContractView.getSelectedItem();
        if (selectedContract != null)
            job.setContract((int) selectedContract.getId());
        else
            job.setContract(null);

        MJPAPIObject selectedHours = (MJPAPIObject) mLocationHoursView.getSelectedItem();
        if (selectedHours != null)
            job.setHours((int) selectedHours.getId());
        else
            job.setHours(null);
    }
}
