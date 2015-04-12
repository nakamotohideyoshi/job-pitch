package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPAPIObject;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.jobseeker.CreateUpdateJobSeekerTask;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JobSeekerEditFragment extends EditFragment<JobSeeker> {
    private EditText mFirstNameView;
    private EditText mLastNameView;
    private EditText mEmailView;
    private CheckBox mEmailPublicView;
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
        View view = inflater.inflate(R.layout.fragment_job_seeker_edit, container, false);

        mFirstNameView = (EditText) view.findViewById(R.id.job_seeker_first_name);
        mLastNameView = (EditText) view.findViewById(R.id.job_seeker_last_name);
        mEmailView = (EditText) view.findViewById(R.id.job_seeker_email);
        mEmailPublicView = (CheckBox) view.findViewById(R.id.job_seeker_email_public);
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

        Map<String, View> fields = new HashMap<>();
        fields.put("first_name", mFirstNameView);
        fields.put("last_name", mLastNameView);
        fields.put("telephone", mTelephoneView);
        fields.put("mobile", mMobileView);
        fields.put("age", mAgeView);
        setFields(fields);

        Collection<View> requiredFields = new ArrayList<>();
        requiredFields.add(mFirstNameView);
        requiredFields.add(mLastNameView);
        setRequiredFields(requiredFields);

        return view;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sexes = application.getSexes();
        mSexView.setAdapter(new ArrayAdapter<Sex>(this.getActivity(), android.R.layout.simple_list_item_1, this.sexes.toArray(new Sex[]{})));
        this.nationalities = application.getNationalities();
        mNationalityView.setAdapter(new ArrayAdapter<Nationality>(this.getActivity(), android.R.layout.simple_list_item_1, this.nationalities.toArray(new Nationality[]{})));
    }

    public void load(JobSeeker jobSeeker) {
        mFirstNameView.setText(jobSeeker.getFirst_name());
        mLastNameView.setText(jobSeeker.getLast_name());
        mEmailView.setText(jobSeeker.getEmail());
        mEmailPublicView.setChecked(jobSeeker.getEmail_public());
        mTelephoneView.setText(jobSeeker.getTelephone());
        mTelephonePublicView.setChecked(jobSeeker.getTelephone_public());
        mMobileView.setText(jobSeeker.getMobile());
        mMobilePublicView.setChecked(jobSeeker.getMobile_public());
        Integer age = jobSeeker.getAge();
        mAgeView.setText(age == null ? null : age.toString());
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

    public void save(JobSeeker jobSeeker) {
        jobSeeker.setFirst_name(mFirstNameView.getText().toString());
        jobSeeker.setLast_name(mLastNameView.getText().toString());
        jobSeeker.setEmail(mEmailView.getText().toString());
        jobSeeker.setEmail_public(mEmailPublicView.isChecked());
        jobSeeker.setTelephone(mTelephoneView.getText().toString());
        jobSeeker.setTelephone_public(mTelephonePublicView.isChecked());
        jobSeeker.setMobile(mMobileView.getText().toString());
        jobSeeker.setMobile_public(mMobilePublicView.isChecked());
        try {
            jobSeeker.setAge(Integer.parseInt(mAgeView.getText().toString()));
        } catch (NumberFormatException e) {}
        jobSeeker.setAge_public(mAgePublicView.isChecked());

        MJPAPIObject selectedSex = (MJPAPIObject) mSexView.getSelectedItem();
        if (selectedSex != null)
            jobSeeker.setSex((int) selectedSex.getId());
        else
            jobSeeker.setSex(null);
        jobSeeker.setSex_public(mSexPublicView.isChecked());

        MJPAPIObject selectedNationality = (MJPAPIObject) mNationalityView.getSelectedItem();
        if (selectedNationality != null)
            jobSeeker.setNationality((int) selectedNationality.getId());
        else
            jobSeeker.setNationality(null);
        jobSeeker.setNationality_public(mNationalityPublicView.isChecked());
    }

    public CreateUpdateJobSeekerTask getCreateBusinessTask(MJPApi api, JobSeeker jobSeeker) {
        CreateUpdateJobSeekerTask task = new CreateUpdateJobSeekerTask(api, jobSeeker);
        task.addListener(this);
        return task;
    }
}
