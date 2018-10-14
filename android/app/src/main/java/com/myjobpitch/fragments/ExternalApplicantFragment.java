package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ExternalApplication;
import com.myjobpitch.api.data.ExternalJobSeeker;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.springframework.core.io.FileSystemResource;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ExternalApplicantFragment extends FormFragment {

    @BindView(R.id.shortlisted)
    CheckBox shortlisted;

    @BindView(R.id.job_item)
    View jobItem;

    @BindView(R.id.job_seeker_first_name)
    MaterialEditText mFirstNameView;
    @BindView(R.id.job_seeker_last_name)
    MaterialEditText mLastNameView;

    @BindView(R.id.job_seeker_email)
    MaterialEditText mEmailView;

    @BindView(R.id.job_seeker_telephone)
    MaterialEditText mTelephoneView;

    @BindView(R.id.job_seeker_mobile)
    MaterialEditText mMobileView;

    @BindView(R.id.job_seeker_age)
    MaterialEditText mAgeView;

    @BindView(R.id.job_seeker_sex)
    MaterialBetterSpinner mSexView;

    @BindView(R.id.job_seeker_nationality)
    MaterialEditText mNationalityView;

    @BindView(R.id.job_seeker_national_number)
    MaterialEditText mNationalNumberView;

    @BindView(R.id.job_seeker_description)
    MaterialEditText mDescriptionView;

    List<String> mSexNames = new ArrayList<>();
    ExternalApplication externalApplication;
    ExternalJobSeeker jobSeeker;
    public Job job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_external_applicant, container, false);
        ButterKnife.bind(this, view);

        title = "Add Application";

        // data
        for (Sex sex : AppData.sexes) {
            mSexNames.add(sex.getName());
        }
        mSexView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, mSexNames));

        load();
        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("first_name", mFirstNameView);
                put("last_name", mLastNameView);
                put("email", mEmailView);
                put("description", mDescriptionView);
            }
        };
    }

    void load() {
        AppHelper.showJobInfo(job, jobItem);
        shortlisted.setChecked(false);
    }

    @OnClick(R.id.job_seeker_nationality_button)
    void onNationality() {
        final List<Nationality> nationalities = AppData.nationalities;
        ArrayList<SelectItem> items = new ArrayList<>();
        for (Nationality nationality : nationalities) {
            items.add(new SelectItem(nationality.getName(), false));
        }

        new SelectDialog(getApp(), "Select Nationality", items, false, new SelectDialog.Action() {
            @Override
            public void apply(int selectedIndex) {
                mNationalityView.setText(nationalities.get(selectedIndex).getName());
            }
        });
    }

    @OnClick(R.id.job_seeker_national_number_help)
    void onNationalNumberHelp() {
        Popup popup = new Popup(getContext(), "Supplying your national insurance number makes it easier for employers to recruit you. Your National Insurance number will not be shared with employers.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    void saveData() {
        if (jobSeeker == null) {
            jobSeeker = new ExternalJobSeeker();
        }
        jobSeeker.setFirst_name(mFirstNameView.getText().toString().trim());
        jobSeeker.setLast_name(mLastNameView.getText().toString().trim());
        jobSeeker.setEmail(mEmailView.getText().toString().trim());
        jobSeeker.setTelephone(mTelephoneView.getText().toString().trim());
        jobSeeker.setMobile(mMobileView.getText().toString().trim());
        if (!mAgeView.getText().toString().isEmpty()) {
            jobSeeker.setAge(Integer.parseInt(mAgeView.getText().toString()));
        }
        int sexIndex = mSexNames.indexOf(mSexView.getText().toString());
        if (sexIndex != -1) {
            jobSeeker.setSex(AppData.sexes.get(sexIndex).getId());
        }
        for (Nationality nationality : AppData.nationalities) {
            if (nationality.getName().equals(mNationalityView.getText().toString())) {
                jobSeeker.setNationality(nationality.getId());
                break;
            }
        }
        jobSeeker.setNational_insurance_number(mNationalNumberView.getText().toString());
        jobSeeker.setDescription(mDescriptionView.getText().toString());
    }

    @OnClick(R.id.job_seeker_cancel)
    void onCancel() {
        getApp().popFragment();
    }

    @OnClick(R.id.job_seeker_save)
    void onSave() {
        if (!valid()) return;

        showLoading();

        saveData();

        if (externalApplication == null) {
            externalApplication = new ExternalApplication();
        }

        externalApplication.setJob(job.getId());
        externalApplication.setShortlisted(shortlisted.isChecked());
        externalApplication.setJob_Seeker(jobSeeker);

        new APITask(new APIAction() {
            @Override
            public void run() {

                MJPApi.shared().addExternalApplication(externalApplication);

            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                getApp().popFragment();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

}
