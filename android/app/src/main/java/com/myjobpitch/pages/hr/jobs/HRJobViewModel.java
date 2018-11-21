package com.myjobpitch.pages.hr.jobs;

import android.arch.lifecycle.LiveData;
import android.arch.lifecycle.MutableLiveData;
import android.arch.lifecycle.ViewModel;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import java.util.ArrayList;
import java.util.List;

public class HRJobViewModel extends ViewModel {

    private MutableLiveData<List<HRJob>> hrJobs;
    private List<Workplace> workplaces;

    public LiveData<List<HRJob>> getHRJobs() {
        if (hrJobs == null) {
            hrJobs = new MutableLiveData<>();
            loadData();
        }
        return hrJobs;
    }

    public void clearHRJobs() {
        hrJobs = null;
    }

    public List<Workplace> getWorkplaces() {
        return workplaces;
    }

    private void loadData() {
        final List<HRJob> data = new ArrayList<>();
        new APITask(() -> {
            data.addAll(MJPApi.shared().getHRJobs());
            workplaces = MJPApi.shared().getUserWorkplaces(null);
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hrJobs.setValue(data);
            }
            @Override
            public void onError(JsonNode errors) {
            }
        }).execute();
    }


}