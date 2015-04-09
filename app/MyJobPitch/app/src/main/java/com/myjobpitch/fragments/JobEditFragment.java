package com.myjobpitch.fragments;

import android.app.Fragment;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Availability;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.tasks.CreateUpdateJobTask;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


/**
 * A simple {@link android.app.Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link com.myjobpitch.fragments.JobEditFragment.JobEditHost} interface
 * to handle interaction events.
 * Use the {@link com.myjobpitch.fragments.JobEditFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class JobEditFragment extends Fragment implements CreateUpdateJobTask.Listener {
    private EditText mLocationTitleView;
    private EditText mLocationDescView;
//    private EditText mLocationEmailView;
//    private CheckBox mLocationEmailPublicView;
//    private EditText mLocationTelephoneView;
//    private CheckBox mLocationTelephonePublicView;
//    private EditText mLocationMobileView;
//    private CheckBox mLocationMobilePublicView;
    private List<TextView> requiredFields;
    private Map<String, TextView> fields;
    private Spinner mLocationSectorView;
    private Spinner mLocationContractView;
    private Spinner mLocationHoursView;
    private Spinner mLocationAvailabilityView;
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;
    private List<Availability> availabilities;

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
        mLocationAvailabilityView = (Spinner) view.findViewById(R.id.job_availability);

        requiredFields = new ArrayList<>();
        requiredFields.add(mLocationTitleView);
        requiredFields.add(mLocationDescView);

        fields = new HashMap<>();
        fields.put("title", mLocationTitleView);
        fields.put("description", mLocationDescView);
//        fields.put("sector", mLocationSectorView);
//        fields.put("telephone", mLocationTelephoneView);
//        fields.put("mobile", mLocationMobileView);

        return view;
    }

    public boolean validateInput() {
        for (TextView field : fields.values())
            field.setError(null);

        View errorField = null;
        for (TextView field : requiredFields) {
            if (TextUtils.isEmpty(field.getText())) {
                field.setError(getString(R.string.error_field_required));
                if (errorField == null)
                    errorField = field;
            }
        }

        if (errorField != null) {
            errorField.requestFocus();
            return false;
        }
        return true;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sectors = application.getSectors();
        mLocationSectorView.setAdapter(new ArrayAdapter<Sector>(this.getActivity(), android.R.layout.simple_list_item_1, this.sectors.toArray(new Sector[] {})));
        this.contracts = application.getContracts();
        mLocationContractView.setAdapter(new ArrayAdapter<Contract>(this.getActivity(), android.R.layout.simple_list_item_1, this.contracts.toArray(new Contract[] {})));
        this.hours = application.getHours();
        mLocationHoursView.setAdapter(new ArrayAdapter<Hours>(this.getActivity(), android.R.layout.simple_list_item_1, this.hours.toArray(new Hours[] {})));
        this.availabilities = application.getAvailabilities();
        mLocationAvailabilityView.setAdapter(new ArrayAdapter<Availability>(this.getActivity(), android.R.layout.simple_list_item_1, this.availabilities.toArray(new Availability[] {})));
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

        if (job.getRequired_availability() != null) {
            for (int i = 0; i < availabilities.size(); i++) {
                if (availabilities.get(i).getId() == job.getRequired_availability()) {
                    mLocationAvailabilityView.setSelection(i);
                    break;
                }
            }
        }
    }

    public void save(Job job) {
        job.setTitle(mLocationTitleView.getText().toString());
        job.setDescription(mLocationDescView.getText().toString());
        job.setSector((int) ((MJPAPIObject) mLocationSectorView.getSelectedItem()).getId());
        job.setContract((int) ((MJPAPIObject) mLocationContractView.getSelectedItem()).getId());
        job.setHours((int) ((MJPAPIObject) mLocationHoursView.getSelectedItem()).getId());
        job.setRequired_availability((int) ((MJPAPIObject) mLocationAvailabilityView.getSelectedItem()).getId());
    }

    public CreateUpdateJobTask getCreateJobTask(MJPApi api, Job job) {
        CreateUpdateJobTask task = new CreateUpdateJobTask(api, job);
        task.addListener(this);
        return task;
    }

    @Override
    public void onSuccess(Job job) {}

    @Override
    public void onError(JsonNode errors) {
        Iterator<Map.Entry<String, JsonNode>> error_data = errors.fields();
        while (error_data.hasNext()) {
            Map.Entry<String, JsonNode> error = error_data.next();
            if (fields.containsKey(error.getKey()))
                fields.get(error.getKey()).setError(error.getValue().get(0).asText());
        }
    }

    @Override
    public void onCancelled() {}

    public interface JobEditHost {

    }

}
