package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteJobImageTask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class JobEditFragment extends FormFragment {

    @BindView(R.id.job_active)
    CheckBox activeView;

    @BindView(R.id.job_title)
    MaterialEditText titleView;

    @BindView(R.id.job_desc)
    MaterialEditText descView;

    @BindView(R.id.job_sector)
    MaterialBetterSpinner sectorView;

    @BindView(R.id.job_contract)
    MaterialBetterSpinner contractView;

    @BindView(R.id.job_hours)
    MaterialBetterSpinner hoursView;

    @BindView(R.id.job_logo)
    View logoView;

    private ImageSelector imageSelector;

    private List<String> sectorNames = new ArrayList<>();
    private List<String> contractNames = new ArrayList<>();
    private List<String> hoursNames = new ArrayList<>();

    public boolean addJobMode = false;
    public Location location;
    public Job job;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        // title and job info

        if (job == null) {
            title = "Add Job";
            load();
        } else {
            title = "Edit Job";

            view.setVisibility(View.INVISIBLE);
            new APITask("Loading...", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    job = MJPApi.shared().getUserJob(job.getId());
                }
                @Override
                protected void onSuccess() {
                    view.setVisibility(View.VISIBLE);
                    load();
                }
            };
        }

        // save button
        addMenuItem("Save", -1);

        return  view;
    }

    private void load() {

        Integer jobSector = -1;
        Integer jobContract = -1;
        Integer jobHours = -1;

        if (job != null) {
            titleView.setText(job.getTitle());
            descView.setText(job.getDescription());
            jobSector = job.getSector();
            jobContract = job.getContract();
            jobHours = job.getHours();

            if (job.getImages().size() > 0) {
                imageSelector.loadImage(job.getImages().get(0).getImage());
            } else {
                Location location = job.getLocation_data();
                if (location.getImages().size() > 0) {
                    imageSelector.setDefaultImage(location.getImages().get(0).getImage());
                } else {
                    Business business = location.getBusiness_data();
                    if (business.getImages().size() > 0) {
                        imageSelector.setDefaultImage(business.getImages().get(0).getImage());
                    }
                }
            }
        }

        for (Sector sector : AppData.get(Sector.class)) {
            sectorNames.add(sector.getName());
            if (sector.getId() == jobSector) {
                sectorView.setText(sector.getName());
            }
        }

        for (Contract contract : AppData.get(Contract.class)) {
            contractNames.add(contract.getName());
            if (contract.getId() == jobContract) {
                contractView.setText(contract.getName());
            }
        }

        for (Hours hours : AppData.get(Hours.class)) {
            hoursNames.add(hours.getName());
            if (hours.getId() == jobHours) {
                hoursView.setText(hours.getName());
            }
        }

        sectorView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, sectorNames));
        contractView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, contractNames));
        hoursView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, hoursNames));

    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("title", titleView);
                put("description", descView);
                put("sector", sectorView);
                put("contract", contractView);
                put("hours", hoursView);
            }
        };
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == ImageSelector.IMAGE_PICK) {
                imageSelector.setImageUri(data.getData());
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            if (valid()) {
                saveJob();
            }
        }
    }

    private void saveJob() {

        if (job == null) {
            job = new Job();
            job.setLocation(location.getId());
        }

        String statusName = activeView.isChecked() ? "OPEN" : "CLOSED";
        job.setStatus(AppData.get(JobStatus.class, statusName).getId());

        job.setTitle(titleView.getText().toString().trim());
        job.setDescription(descView.getText().toString().trim());

        int sectorIndex = sectorNames.indexOf(sectorView.getText().toString());
        job.setSector(AppData.get(Sector.class).get(sectorIndex).getId());

        int contractIndex = contractNames.indexOf(contractView.getText().toString());
        job.setContract(AppData.get(Contract.class).get(contractIndex).getId());

        int hoursIndex = hoursNames.indexOf(hoursView.getText().toString());
        job.setHours(AppData.get(Hours.class).get(hoursIndex).getId());

        Loading.show("Saving...");

        new APITask(this) {
            @Override
            protected void runAPI() throws MJPApiException {
                if (job.getId() == null) {
                    job = MJPApi.shared().createJob(job);
                } else {
                    job = MJPApi.shared().updateJob(job);
                }
            }
            @Override
            protected void onSuccess() {
                saveLogo();
            }
        };

    }

    private void saveLogo() {

        if (imageSelector.getImageUri() != null) {
            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-job-images", "job", imageSelector.getImageUri(), job);
            uploadTask.addListener(new APITaskListener<Boolean>() {
                @Override
                public void onPostExecute(Boolean success) {
                    compltedSave();
                }
                @Override
                public void onCancelled() {
                }
            });
            uploadTask.execute();

        } else if (job.getImages().size() > 0 && imageSelector.getImage() == null) {

            DeleteJobImageTask deleteTask = new DeleteJobImageTask(job.getImages().get(0).getId());
            deleteTask.addListener(new DeleteAPITaskListener() {
                @Override
                public void onSuccess() {
                    compltedSave();
                }
                @Override
                public void onError(JsonNode errors) {
                    Popup.showError("Error deleting image");
                }
                @Override
                public void onConnectionError() {
                    Popup.showError("Connection Error: Please check your internet connection");
                }
                @Override
                public void onCancelled() {}
            });
            deleteTask.execute();

        } else {

            compltedSave();

        }
    }

    private void compltedSave() {
        Loading.hide();
        if (addJobMode) {
            FragmentManager fragmentManager = getApp().getSupportFragmentManager();
            while (fragmentManager.getBackStackEntryCount() > 1) {
                fragmentManager.popBackStackImmediate(fragmentManager.getBackStackEntryCount()-1, FragmentManager.POP_BACK_STACK_INCLUSIVE);
            }
        }
        getApp().popFragment();
    }

}
