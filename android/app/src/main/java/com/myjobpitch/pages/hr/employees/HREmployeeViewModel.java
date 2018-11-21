package com.myjobpitch.pages.hr.employees;

import android.arch.lifecycle.LiveData;
import android.arch.lifecycle.MutableLiveData;
import android.arch.lifecycle.ViewModel;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.HREmployee;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;

import java.util.ArrayList;
import java.util.List;

public class HREmployeeViewModel extends ViewModel {

    private MutableLiveData<List<HREmployee>> hrEmployees;

    public LiveData<List<HREmployee>> getHREmployees() {
        if (hrEmployees == null) {
            hrEmployees = new MutableLiveData<>();
            loadData();
        }
        return hrEmployees;
    }

    public void clearHREmployees() {
        hrEmployees = null;
    }

    private void loadData() {
        final List<HREmployee> data = new ArrayList<>();
        new APITask(() -> data.addAll(MJPApi.shared().getHREmployees())).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hrEmployees.setValue(data);
            }
            @Override
            public void onError(JsonNode errors) {
            }
        }).execute();
    }


}