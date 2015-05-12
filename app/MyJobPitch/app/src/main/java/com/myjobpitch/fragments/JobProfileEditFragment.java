package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Spinner;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.widgets.MJPObjectWithNameAdapter;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobProfileEditFragment extends EditFragment {
    private Spinner mProfileSectorsView;
    private Spinner mProfileContractView;
    private Spinner mProfileHoursView;
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;

    public static JobProfileEditFragment newInstance() {
        JobProfileEditFragment fragment = new JobProfileEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public JobProfileEditFragment() {
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
        View view = inflater.inflate(R.layout.fragment_job_profile_edit, container, false);

        mProfileSectorsView = (Spinner) view.findViewById(R.id.job_profile_sectors);
        mProfileContractView = (Spinner) view.findViewById(R.id.job_profile_contract);
        mProfileHoursView = (Spinner) view.findViewById(R.id.job_profile_hours);

        Map<String, View> fields = new HashMap<>();
        fields.put("sectors", mProfileSectorsView);
        fields.put("contract", mProfileContractView);
        fields.put("hours", mProfileHoursView);
        setFields(fields);

        setRequiredFields(fields.values());

        return view;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sectors = application.get(Sector.class);
        mProfileSectorsView.setAdapter(new MJPObjectWithNameAdapter(this.getActivity(), android.R.layout.simple_list_item_1, this.sectors));
        this.contracts = application.get(Contract.class);
        mProfileContractView.setAdapter(new MJPObjectWithNameAdapter<Contract>(this.getActivity(), android.R.layout.simple_list_item_1, this.contracts));
        this.hours = application.get(Hours.class);
        mProfileHoursView.setAdapter(new MJPObjectWithNameAdapter<Hours>(this.getActivity(), android.R.layout.simple_list_item_1, this.hours));
    }

    public void load(JobProfile jobProfile) {
        List<Integer> selectedSectors = jobProfile.getSectors();
        if (jobProfile.getSectors() != null && !selectedSectors.isEmpty()) {
            Integer selectedSector = selectedSectors.get(0);
            for (int i = 0; i < sectors.size(); i++) {
                if (this.sectors.get(i).getId() == selectedSector) {
                    mProfileSectorsView.setSelection(i);
                    break;
                }
            }
        }

        Integer selectedContract = jobProfile.getContract();
        if (selectedContract != null) {
            for (int i = 0; i < contracts.size(); i++) {
                if (contracts.get(i).getId() == selectedContract) {
                    mProfileContractView.setSelection(i);
                    break;
                }
            }
        }

        Integer selectedHours = jobProfile.getHours();
        if (selectedHours != null) {
            for (int i = 0; i < this.hours.size(); i++) {
                if (this.hours.get(i).getId() == selectedHours) {
                    mProfileHoursView.setSelection(i);
                    break;
                }
            }
        }
    }

    public void save(JobProfile jobProfile) {
        MJPAPIObject selectedSector = (MJPAPIObject) mProfileSectorsView.getSelectedItem();

        if (selectedSector != null)
            jobProfile.setSectors(Arrays.asList(new Integer[]{selectedSector.getId()}));
        else
            jobProfile.setSectors(null);

        MJPAPIObject selectedContract = (MJPAPIObject) mProfileContractView.getSelectedItem();
        if (selectedContract != null)
            jobProfile.setContract((int) selectedContract.getId());
        else
            jobProfile.setContract(null);

        MJPAPIObject selectedHours = (MJPAPIObject) mProfileHoursView.getSelectedItem();
        if (selectedHours != null)
            jobProfile.setHours((int) selectedHours.getId());
        else
            jobProfile.setHours(null);
    }
}
