package com.myjobpitch.pages.hr.jobs;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.FormFragment;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.views.SelectDialog;
import com.rengwuxian.materialedittext.MaterialEditText;

import java.util.ArrayList;
import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class HRJobEditFragment extends FormFragment {

    @BindView(R.id.workplace)
    MaterialEditText workplaceView;

    @BindView(R.id.title)
    MaterialEditText titleView;

    @BindView(R.id.description)
    MaterialEditText descriptionView;

    public HRJob hrJob;

    Integer workplace;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_hrjob_edit, container, false);
        ButterKnife.bind(this, view);

        if (hrJob == null) {
            title = "Add Job";
        } else {
            title = "Edit Job";

            workplace = hrJob.getLocation();
            workplaceView.setText(AppData.getObjById(AppData.workplaces, workplace).getName());
            titleView.setText(hrJob.getTitle());
            descriptionView.setText(hrJob.getDescription());
        }

        return view;
    }

    @OnClick(R.id.workplace)
    void onWorkplace() {
        ArrayList<SelectDialog.SelectItem> items = new ArrayList<>();
        for (int i = 0; i < AppData.workplaces.size(); i++) {
            Location obj = AppData.workplaces.get(i);
            items.add(new SelectDialog.SelectItem(obj.getName(), false));
        }

        new SelectDialog(getContext(), "Select Workplace", items, false, selectedIndex -> {
            Location obj = AppData.workplaces.get(selectedIndex);
            workplace = obj.getId();
            workplaceView.setText(obj.getName());
        });
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("title", titleView);
                put("description", descriptionView);
                put("location", workplaceView);
            }
        };
    }

    @OnClick(R.id.save_button)
    void onSave() {
        if (!valid()) return;

        HRJob newHRJob = new HRJob();
        newHRJob.setTitle(titleView.getText().toString().trim());
        newHRJob.setDescription(descriptionView.getText().toString().trim());
        newHRJob.setLocation(workplace);

        showLoading();

        new APITask(() -> {
            if (hrJob == null) {
                hrJob = MJPApi.shared().createHRJob(newHRJob);
            } else {
                hrJob = MJPApi.shared().updateHRJob(hrJob.getId(), newHRJob);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                AppData.updateObj(AppData.hrJobs, hrJob);
                getApp().popFragment();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

}
