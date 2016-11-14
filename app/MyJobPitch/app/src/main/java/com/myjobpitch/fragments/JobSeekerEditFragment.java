package com.myjobpitch.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;

import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.activities.LoginActivity;
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
    private CheckBox mActiveView;
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
    private EditText mDescriptionView;
    private TextView mDescriptionCharacters;
    private CheckBox mHasReferencesView;
    private CheckBox mTickBox;

    public Button mSaveButton;

    public TextView cvFileName;

    public JobSeekerEditFragment() {
        // Required empty public constructor
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_job_seeker_edit, container, false);

        mActiveView = (CheckBox) view.findViewById(R.id.job_seeker_active);
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
        mDescriptionView = (EditText) view.findViewById(R.id.job_seeker_description);
        mDescriptionCharacters = (TextView) view.findViewById(R.id.job_seeler_description_character_count);
        mHasReferencesView = (CheckBox) view.findViewById(R.id.job_seeker_has_references);
        mTickBox = (CheckBox)view.findViewById(R.id.tickbox);

        mFirstNameView.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                String str = mFirstNameView.getText().toString();
                if (!str.equals(str.toUpperCase())) {
                    int pos = mFirstNameView.getSelectionStart();
                    mFirstNameView.setText(str.toUpperCase());
                    mFirstNameView.setSelection(pos);
                }
            }

            @Override
            public void afterTextChanged(Editable editable) {
            }
        });

        mLastNameView.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {
            }

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                String str = mLastNameView.getText().toString();
                if (!str.equals(str.toUpperCase())) {
                    int pos = mLastNameView.getSelectionStart();
                    mLastNameView.setText(str.toUpperCase());
                    mLastNameView.setSelection(pos);
                }
            }

            @Override
            public void afterTextChanged(Editable editable) {
            }
        });

        mEmailView.setText(LoginActivity.myEmail);
        mEmailView.setEnabled(false);

        cvFileName = (TextView)view.findViewById(R.id.cvFileName);

        view.findViewById(R.id.uploadCV).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.setType("*/*");
                startActivityForResult(Intent.createChooser(intent, "Select File"), 10000);
            }
        });

        mTickBox.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                if (mSaveButton != null) {
                    mSaveButton.setEnabled(isChecked);
                }
            }
        });

        mDescriptionView.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence charSequence, int i, int i1, int i2) {}

            @Override
            public void onTextChanged(CharSequence charSequence, int i, int i1, int i2) {
                mDescriptionCharacters.setText(getString(R.string.characters_remaining, 1000 - charSequence.length()));
            }

            @Override
            public void afterTextChanged(Editable editable) {}
        });

        Map<String, View> fields = new HashMap<>();
        fields.put("first_name", mFirstNameView);
        fields.put("last_name", mLastNameView);
        fields.put("telephone", mTelephoneView);
        fields.put("mobile", mMobileView);
        fields.put("age", mAgeView);
        fields.put("nationality", mNationalityView);
        fields.put("sex", mSexView);
        fields.put("description", mDescriptionView);
        fields.put("has_references", mHasReferencesView);
        fields.put("truth_confirmation", mTickBox);
        setFields(fields);

        Collection<View> requiredFields = new ArrayList<>();
        requiredFields.add(mFirstNameView);
        requiredFields.add(mLastNameView);
        requiredFields.add(mDescriptionView);
        setRequiredFields(requiredFields);

        return view;
    }

    public void loadApplicationData(MJPApplication application) {
        this.sexes = application.get(Sex.class);
        mSexView.setAdapter(new ArrayAdapter<Sex>(this.getActivity(), android.R.layout.simple_list_item_1, this.sexes.toArray(new Sex[]{})));
        this.nationalities = application.get(Nationality.class);
        mNationalityView.setAdapter(new ArrayAdapter<Nationality>(this.getActivity(), android.R.layout.simple_list_item_1, this.nationalities.toArray(new Nationality[]{})));
    }

    public void load(JobSeeker jobSeeker) {

        String firstname = jobSeeker.getFirst_name();
        String lastname = jobSeeker.getLast_name();

        mFirstNameView.setText(firstname.substring(0,1).toUpperCase()+firstname.substring(1).toLowerCase());
        mLastNameView.setText(lastname.substring(0,1).toUpperCase()+lastname.substring(1).toLowerCase());
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
        mDescriptionView.setText(jobSeeker.getDescription());
        mActiveView.setChecked(jobSeeker.isActive());
        mHasReferencesView.setChecked(jobSeeker.getHasReferences());
        mTickBox.setChecked(jobSeeker.getTruthConfirmation());
        mSaveButton.setEnabled(mTickBox.isChecked());
    }

    public void save(JobSeeker jobSeeker) {

        String firstname = mFirstNameView.getText().toString();
        String lastname = mLastNameView.getText().toString();

        jobSeeker.setFirst_name(firstname.substring(0,1).toUpperCase()+firstname.substring(1).toLowerCase());
        jobSeeker.setLast_name(lastname.substring(0,1).toUpperCase()+lastname.substring(1).toLowerCase());
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
        jobSeeker.setDescription(mDescriptionView.getText().toString());
        jobSeeker.setActive(mActiveView.isChecked());
        jobSeeker.setHasReferences(mHasReferencesView.isChecked());
        jobSeeker.setTruthConfirmation(mTickBox.isChecked());
    }

    public CreateUpdateJobSeekerTask getCreateJobSeekerTask(MJPApi api, JobSeeker jobSeeker) {
        CreateUpdateJobSeekerTask task = new CreateUpdateJobSeekerTask(api, jobSeeker);
        task.addListener(this);
        return task;
    }

}
