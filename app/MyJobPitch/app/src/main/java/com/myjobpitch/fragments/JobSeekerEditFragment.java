package com.myjobpitch.fragments;

import android.app.Fragment;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.CreateUpdateJobSeekerTask;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


/**
 * A simple {@link android.app.Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link com.myjobpitch.fragments.JobSeekerEditFragment.BusinessEditHost} interface
 * to handle interaction events.
 * Use the {@link com.myjobpitch.fragments.JobSeekerEditFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class JobSeekerEditFragment extends Fragment implements CreateUpdateJobSeekerTask.Listener<JobSeeker> {

    private EditText mFirstNameView;
    private EditText mLastNameView;
    private EditText mTelephoneView;
    private CheckBox mTelephonePublicView;
    private EditText mMobileView;
    private CheckBox mMobilePublicView;
    private EditText mAgeView;
    private CheckBox mAgePublicView;
    private Spinner mSexView;
    private CheckBox mSexPublicView;
    private Spinner mNationalityView;
    private CheckBox mNationalityPublicView;
    private List<TextView> requiredFields;
    private Map<String, TextView> fields;
    private List<Sex> sexes;
    private List<Nationality> nationalities;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static JobSeekerEditFragment newInstance() {
        JobSeekerEditFragment fragment = new JobSeekerEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public JobSeekerEditFragment() {
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

        mFirstNameView = (EditText) view.findViewById(R.id.job_seeker_first_name);
        mLastNameView = (EditText) view.findViewById(R.id.job_seeker_last_name);
        mTelephoneView = (EditText) view.findViewById(R.id.job_seeker_telephone);
        mTelephonePublicView = (CheckBox) view.findViewById(R.id.job_seeker_telephone_public);
        mMobileView = (EditText) view.findViewById(R.id.job_seeker_mobile);
        mMobilePublicView = (CheckBox) view.findViewById(R.id.job_seeker_mobile_public);
        mAgeView = (EditText) view.findViewById(R.id.job_seeker_age);
        mAgePublicView = (CheckBox) view.findViewById(R.id.job_seeker_age_public);
        mSexView = (Spinner) view.findViewById(R.id.job_seeker_sex);
        mSexPublicView = (CheckBox) view.findViewById(R.id.job_seeker_sex_public);
        mNationalityView = (Spinner) view.findViewById(R.id.job_seeker_nationality);
        mNationalityPublicView = (CheckBox) view.findViewById(R.id.job_seeker_nationality_public);

        requiredFields = new ArrayList<>();
        requiredFields.add(mFirstNameView);
        requiredFields.add(mLastNameView);

        fields = new HashMap<>();
        fields.put("first_name", mFirstNameView);
        fields.put("last_name", mLastNameView);
        fields.put("telephone", mTelephoneView);
        fields.put("mobile", mMobileView);
        fields.put("age", mAgeView);

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
        this.sexes = application.getSexes();
        mSexView.setAdapter(new ArrayAdapter<Sex>(this.getActivity(), android.R.layout.simple_list_item_1, this.sexes.toArray(new Sex[]{})));
        this.nationalities = application.getNationalities();
        mNationalityView.setAdapter(new ArrayAdapter<Nationality>(this.getActivity(), android.R.layout.simple_list_item_1, this.nationalities.toArray(new Nationality[]{})));
    }

    public void load(User user, JobSeeker jobSeeker) {
        mFirstNameView.setText(user.getFirst_name());
        mLastNameView.setText(user.getLast_name());
        if (jobSeeker != null) {
            mTelephoneView.setText(jobSeeker.getTelephone());
            mTelephonePublicView.setChecked(jobSeeker.getTelephone_public());
            mMobileView.setText(jobSeeker.getMobile());
            mMobilePublicView.setChecked(jobSeeker.getMobile_public());
            mAgeView.setText(jobSeeker.getAge());
            mAgePublicView.setChecked(jobSeeker.getAge_public());

            if (jobSeeker.getSex() != null) {
                for (int i = 0; i < sexes.size(); i++) {
                    if (sexes.get(i).getId() == jobSeeker.getSex()) {
                        mSexView.setSelection(i);
                        break;
                    }
                }
            }
            mSexPublicView.setChecked(jobSeeker.getSex_public());

            if (jobSeeker.getNationality() != null) {
                for (int i = 0; i < nationalities.size(); i++) {
                    if (nationalities.get(i).getId() == jobSeeker.getNationality()) {
                        mNationalityView.setSelection(i);
                        break;
                    }
                }
            }
            mNationalityPublicView.setChecked(jobSeeker.getNationality_public());
        }
    }

    public void save(User user, JobSeeker jobSeeker) {
        user.setFirst_name(mFirstNameView.getText().toString());
        user.setLast_name(mLastNameView.getText().toString());
        jobSeeker.setTelephone(mTelephoneView.getText().toString());
        jobSeeker.setTelephone_public(mTelephonePublicView.isChecked());
        jobSeeker.setMobile(mMobileView.getText().toString());
        jobSeeker.setMobile_public(mMobilePublicView.isChecked());
        try {
            jobSeeker.setAge(Integer.parseInt(mAgeView.getText().toString()));
        } catch (NumberFormatException e) {}
        jobSeeker.setAge_public(mAgePublicView.isChecked());
        jobSeeker.setSex((int) ((MJPAPIObject) mSexView.getSelectedItem()).getId());
        jobSeeker.setSex_public(mSexPublicView.isChecked());
        jobSeeker.setNationality((int) ((MJPAPIObject) mNationalityView.getSelectedItem()).getId());
        jobSeeker.setNationality_public(mNationalityPublicView.isChecked());
    }

    public CreateUpdateJobSeekerTask getCreateBusinessTask(MJPApi api, JobSeeker jobSeeker) {
        CreateUpdateJobSeekerTask task = new CreateUpdateJobSeekerTask(api, jobSeeker);
        task.addListener(this);
        return task;
    }

    @Override
    public void onSuccess(JobSeeker result) {

    }

    @Override
    public void onError(JsonNode errors) {
        Iterator<Map.Entry<String, JsonNode>> error_data = errors.fields();
        while (error_data.hasNext()) {
            Map.Entry<String, JsonNode> error = error_data.next();
            if (fields.containsKey(error.getKey()))
                fields.get(error.getKey()).setError(error.getValue().textValue());
        }
    }

    @Override
    public void onCancelled() {

    }

    public interface BusinessEditHost {

    }

}
