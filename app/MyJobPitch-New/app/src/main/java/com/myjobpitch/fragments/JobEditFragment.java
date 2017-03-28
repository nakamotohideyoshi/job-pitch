package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;

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
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.DeleteAPITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.tasks.recruiter.DeleteJobImageTask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Popup;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.apache.commons.lang3.SerializationUtils;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class JobEditFragment extends BaseFragment {

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

    ImageSelector imageSelector;

    List<String> sectorNames = new ArrayList<>();
    List<String> contractNames = new ArrayList<>();
    List<String> hoursNames = new ArrayList<>();

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_job_edit, container, false);
        ButterKnife.bind(this, view);

        imageSelector = new ImageSelector(logoView, R.drawable.default_logo);

        // title and job info

        Job job = LocationDetailFragment.selectedJob;

        Integer jobSector = -1;
        Integer jobContract = -1;
        Integer jobHours = -1;

        if (job == null) {
            title = "Add Job";
        } else {
            title = "Edit Job";

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

        // save button

        Menu menu = getApp().getToolbarMenu();
        MenuItem saveItem = menu.add(Menu.NONE, 100, 1, "Save");
        saveItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);

        return  view;
    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"title", titleView},
                {"description", descView},
                {"sector", sectorView},
                {"contract", contractView},
                {"hours", hoursView}
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
            if (!valid()) return;
            saveJob();
        }
    }

    void saveJob() {
        AppHelper.showLoading("Saving...");

        final Job job;
        if (LocationDetailFragment.selectedJob == null) {
            job = new Job();
            job.setLocation(BusinessDetailFragment.selectedLocation.getId());
        } else {
            job = SerializationUtils.clone(LocationDetailFragment.selectedJob);
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

        new AsyncTask<Void, Void, Job>() {
            @Override
            protected Job doInBackground(Void... params) {
                try {
                    if (job.getId() == null) {
                        Job newJob = MJPApi.shared().createJob(job);
                        BusinessDetailFragment.selectedLocation = MJPApi.shared().get(Location.class, BusinessDetailFragment.selectedLocation.getId());
                        BusinessDetailFragment.requestReloadLocations = true;
                        return newJob;
                    } else {
                        return MJPApi.shared().updateJob(job);
                    }
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Job data) {
                if (data != null) {
                    LocationDetailFragment.requestReloadJobs = true;
                    LocationDetailFragment.selectedJob = data;
                    saveLogo();
                }
            }
        }.execute();
    }

    void saveLogo() {
        Job job = LocationDetailFragment.selectedJob;
        if (imageSelector.getImageUri() != null) {
            UploadImageTask uploadTask = new UploadImageTask(getApp(), "user-job-images", "job", imageSelector.getImageUri(), job);
            uploadTask.addListener(new APITaskListener<Boolean>() {
                @Override
                public void onPostExecute(Boolean success) {
                    reloadJob();
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
                    reloadJob();
                }
                @Override
                public void onError(JsonNode errors) {
                    Popup.showGreen("Error deleting image", null, null, "OK", null, true);
                }
                @Override
                public void onConnectionError() {
                    Popup.showGreen("Connection Error: Please check your internet connection", null, null, "OK", null, true);
                }
                @Override
                public void onCancelled() {}
            });
            deleteTask.execute();
        } else {
            AppHelper.hideLoading();
            getApp().popFragment();
        }
    }

    void reloadJob() {
        new AsyncTask<Void, Void, Job>() {
            @Override
            protected Job doInBackground(Void... params) {
                try {
                    return MJPApi.shared().getUserJob(LocationDetailFragment.selectedJob.getId());
                } catch (MJPApiException e) {
                    Popup.showGreen(e.getMessage(), null, null, "OK", null, true);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(Job data) {
                if (data != null) {
                    AppHelper.hideLoading();
                    LocationDetailFragment.selectedJob = data;
                    getApp().popFragment();
                }
            }
        }.execute();
    }

}
