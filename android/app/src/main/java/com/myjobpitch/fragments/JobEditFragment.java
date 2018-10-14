package com.myjobpitch.fragments;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.CheckBox;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.CameraActivity;
import com.myjobpitch.MediaPlayerActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobPitchForCreation;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.UploadImageTask;
import com.myjobpitch.uploader.AWSPitchUploader;
import com.myjobpitch.uploader.PitchUpload;
import com.myjobpitch.uploader.PitchUploadListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageSelector;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.views.Popup;
import com.myjobpitch.views.SelectDialog;
import com.myjobpitch.views.SelectDialog.SelectItem;
import com.rengwuxian.materialedittext.MaterialEditText;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class JobEditFragment extends FormFragment {

    static final int REQUEST_NEW_PITCH = 2;

    @BindView(R.id.job_active)
    CheckBox activeView;

    @BindView(R.id.job_require_pitch)
    CheckBox requirePitch;

    @BindView(R.id.job_require_cv)
    CheckBox requireCV;

    @BindView(R.id.job_title)
    MaterialEditText titleView;

    @BindView(R.id.job_desc)
    MaterialEditText descView;

    @BindView(R.id.job_sector)
    MaterialEditText sectorView;

    @BindView(R.id.job_contract)
    MaterialBetterSpinner contractView;

    @BindView(R.id.job_hours)
    MaterialBetterSpinner hoursView;

    @BindView(R.id.job_video_play)
    View mRecordVideoPlay;

    @BindView(R.id.job_logo)
    View logoView;

    private ImageSelector imageSelector;

    private List<String> contractNames = new ArrayList<>();
    private List<String> hoursNames = new ArrayList<>();

    private boolean isAddMode = false;
    private boolean isNew = false;

    public Location location;
    public Job job;
    public boolean activation = false;

    Pitch mPitch;
    String mVideoPath;
    int requestCode;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_edit, container, false);
        ButterKnife.bind(this, view);

        isAddMode = getApp().getCurrentMenuID() != R.id.menu_business;


        // title and job info

        if (job == null) {

            title = "Add Job";
            isNew = true;
            load();

        } else {

            location = job.getLocation_data();

            addMenuItem(MENUGROUP2, 100, "Share", R.drawable.ic_share);

            if (title != "") {
                load();
                if (mVideoPath != null) {
                    mRecordVideoPlay.setVisibility(View.VISIBLE);
                }
            } else {
                title = "Edit Job";

                showLoading(view);
                new APITask(new APIAction() {
                    @Override
                    public void run() {
                        job = MJPApi.shared().getUserJob(job.getId());
                    }
                }).addListener(new APITaskListener() {
                    @Override
                    public void onSuccess() {
                        hideLoading();
                        load();
                        if (mVideoPath != null) {
                            mRecordVideoPlay.setVisibility(View.VISIBLE);
                        }
                    }
                    @Override
                    public void onError(JsonNode errors) {
                        errorHandler(errors);
                    }
                }).execute();
            }

        }

        return  view;
    }

    private void load() {

        String defaultPath = null;
        if (location.getImages().size() > 0) {
            defaultPath = location.getImages().get(0).getImage();
        } else {
            Business business = location.getBusiness_data();
            if (business.getImages().size() > 0) {
                defaultPath = business.getImages().get(0).getImage();
            }
        }
        if (defaultPath == null) {
            imageSelector = new ImageSelector(logoView, R.drawable.default_logo);
        } else {
            imageSelector = new ImageSelector(logoView, defaultPath);
        }

        Integer jobSector = -1;
        Integer jobContract = -1;
        Integer jobHours = -1;

        if (job != null) {

            activeView.setChecked(JobStatus.OPEN_ID == job.getStatus());

            requirePitch.setChecked(job.getRequires_pitch());
            requireCV.setChecked(job.getRequires_cv());

            titleView.setText(job.getTitle());
            descView.setText(job.getDescription());
            jobSector = job.getSector();
            jobContract = job.getContract();
            jobHours = job.getHours();

            if (job.getImages().size() > 0) {
                imageSelector.loadImage(job.getImages().get(0).getImage());
            } else {
                imageSelector.loadImage(null);
            }

            mPitch = job.getPitch();
            mRecordVideoPlay.setVisibility(mPitch != null && mPitch.getVideo() != null ? View.VISIBLE : View.INVISIBLE);

        } else {
            imageSelector.loadImage(null);
            mRecordVideoPlay.setVisibility(View.INVISIBLE);
        }

        if (jobSector != -1) {
            sectorView.setText(AppData.getNameById(AppData.sectors, jobSector));
        }

        for (Contract contract : AppData.contracts) {
            contractNames.add(contract.getName());
            if (contract.getId() == jobContract) {
                contractView.setText(contract.getName());
            }
        }

        for (Hours hours : AppData.hours) {
            hoursNames.add(hours.getName());
            if (hours.getId() == jobHours) {
                hoursView.setText(hours.getName());
            }
        }

        contractView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, contractNames));
        hoursView.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, hoursNames));

    }

    @OnClick(R.id.job_sector_button)
    void onSector() {
        ArrayList<SelectItem> items = new ArrayList<>();
        for (Sector sector : AppData.sectors) {
            items.add(new SelectItem(sector.getName(), false));
        }

        new SelectDialog(getApp(), "Select Sector", items, false, new SelectDialog.Action() {
            @Override
            public void apply(int selectedIndex) {
                sectorView.setText(AppData.sectors.get(selectedIndex).getName());
            }
        });
    }

    @OnClick(R.id.job_pitch_help)
    void onPitchHelp() {
        Popup popup = new Popup(getContext(), "In a competative job market, job seekers would like know what kind of workplace they will be working in.\nUse a video pitch to showcase why your business is a great place to work, and why great candidates should choose this role.", true);
        popup.addGreyButton("Close", null);
        popup.show();
    }

    @OnClick(R.id.job_record_new)
    void onRecordNew() {
        Intent intent = new Intent(getApp(), CameraActivity.class);
        startActivityForResult(intent, REQUEST_NEW_PITCH);
        requestCode = REQUEST_NEW_PITCH;
    }

    @OnClick(R.id.job_video_play)
    void onPitchPlay() {
        String path = null;
        if (mVideoPath != null) {
            path = mVideoPath;
        } else if (mPitch != null) {
            path = mPitch.getVideo();
        }
        if (path != null) {
            Intent intent = new Intent(getApp(), MediaPlayerActivity.class);
            intent.putExtra(MediaPlayerActivity.PATH, path);
            startActivity(intent);
        }
    }

    @OnClick(R.id.job_active)
    void onActivate() {
        if (!activeView.isChecked()) {
            Popup popup = new Popup(getContext(), "Your job posting will not be visible for jobseekers and will not be able to apply or message you for this job.", true);
            popup.addGreenButton("Deactivate", new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                }
            });
            popup.addGreyButton("Cancel", new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    activeView.setChecked(true);
                }
            });
            popup.show();
        }
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
            if (this.requestCode == REQUEST_NEW_PITCH) {
                mVideoPath = data.getStringExtra(CameraActivity.OUTPUT_FILE);
                mRecordVideoPlay.setVisibility(View.VISIBLE);
            } else if (requestCode == AppData.REQUEST_IMAGE_CAPTURE) {
                Bitmap photo = (Bitmap) data.getExtras().get("data");
                File file = AppHelper.saveBitmap(photo);
                imageSelector.setImageUri(Uri.fromFile(file));
            } else if (requestCode == AppData.REQUEST_IMAGE_PICK) {
                imageSelector.setImageUri(data.getData());
            } else if (requestCode == AppData.REQUEST_GOOGLE_DRIVE || requestCode == AppData.REQUEST_DROPBOX) {
                String path = (String) data.getExtras().get("path");
                imageSelector.setImageUri(Uri.fromFile(new File(path)));
            }
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            String link = String.format("%sjobseeker/jobs/%d", MJPApi.apiUrl, job.getId());
            Intent sharingIntent = new Intent(Intent.ACTION_SEND);
            sharingIntent.setType("text/html");
            sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
            startActivity(Intent.createChooser(sharingIntent,"Share using"));
        }
    }

    void saveData() {
        if (job == null) {
            job = new Job();
            job.setLocation(location.getId());
        }

        String statusName = activeView.isChecked() ? "OPEN" : "CLOSED";
        job.setRequires_pitch(requirePitch.isChecked());
        job.setRequires_cv(requireCV.isChecked());
        job.setStatus(AppData.getIdByName(AppData.jobStatuses, statusName));

        job.setTitle(titleView.getText().toString().trim());
        job.setDescription(descView.getText().toString().trim());

        for (Sector sector : AppData.sectors) {
            if (sector.getName().equals(sectorView.getText().toString())) {
                job.setSector(sector.getId());
                break;
            }
        }

        int contractIndex = contractNames.indexOf(contractView.getText().toString());
        job.setContract(AppData.contracts.get(contractIndex).getId());

        int hoursIndex = hoursNames.indexOf(hoursView.getText().toString());
        job.setHours(AppData.hours.get(hoursIndex).getId());
    }

    @OnClick(R.id.job_save)
    void saveJob() {

        if (!valid()) return;

        saveData();

        showLoading();

        new APITask(new APIAction() {
            @Override
            public void run() {
                if (job.getId() == null) {
                    job = MJPApi.shared().createJob(job);
                } else {
                    job = MJPApi.shared().updateJob(job);
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                saveLogo();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    private void saveLogo() {

        if (imageSelector.getImageUri() != null) {

            new UploadImageTask(getApp(), "user-job-images", "job", imageSelector.getImageUri(), job)
            .addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    uploadPitch();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();

        } else if (job.getImages().size() > 0 && imageSelector.getImage() == null) {

            new APITask(new APIAction() {
                @Override
                public void run() {
                    MJPApi.shared().deleteJobImage(job.getImages().get(0).getId());
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    uploadPitch();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();

        } else {
            uploadPitch();
        }
    }

    void uploadPitch() {

        if (mVideoPath == null) {
            compltedSave();
            return;
        }

        new APITask(new APIAction() {
            @Override
            public void run() {
                JobPitchForCreation data = new JobPitchForCreation();
                data.setJob(job.getId());
                mPitch = MJPApi.shared().createJobPitch(data);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                AWSPitchUploader pitchUploader = new AWSPitchUploader(getApp(), "job-videos");
                PitchUpload upload = pitchUploader.upload(new File(mVideoPath), mPitch);
                upload.setPitchUploadListener(new PitchUploadListener() {
                    @Override
                    public void onStateChange(int state) {
                        switch (state) {
                            case PitchUpload.STARTING:
                                break;
                            case PitchUpload.UPLOADING:
                                loading.setType(Loading.Type.PROGRESS);
                                break;
                            case PitchUpload.PROCESSING:
                                loading.setType(Loading.Type.SPIN);
                                break;
                            case PitchUpload.COMPLETE:
                                compltedSave();
                                break;
                        }
                    }

                    @Override
                    public void onProgress(double current, long total) {
                        int complete = (int) (((float) current / total) * 100);
                        if (complete < 100) {
                            loading.setProgress(complete);
                            loading.setLabel(Integer.toString(complete) + "%");
                        }
                    }

                    @Override
                    public void onError(String message) {
                        hideLoading();
                        Popup popup = new Popup(getContext(), "Error uploading video!", true);
                        popup.addGreyButton("Ok", null);
                        popup.show();
                    }
                });
                upload.start();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    private void compltedSave() {
        if (!isNew || activation) {
            getApp().popFragment();
            return;
        }

        FragmentManager fragmentManager = getApp().getSupportFragmentManager();
        if (isAddMode) {
            while (fragmentManager.getBackStackEntryCount() > 1) {
                fragmentManager.popBackStackImmediate(fragmentManager.getBackStackEntryCount()-1, FragmentManager.POP_BACK_STACK_INCLUSIVE);
            }
            getApp().popFragment();
        } else {
            fragmentManager.popBackStackImmediate();
            JobDetailFragment fragment = new JobDetailFragment();
            fragment.job = job;
            getApp().pushFragment(fragment);
        }
    }

}
