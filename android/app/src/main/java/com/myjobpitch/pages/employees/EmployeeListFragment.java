package com.myjobpitch.pages.employees;

import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Employee;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class EmployeeListFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;

    @BindView(R.id.list_view)
    ListView listView;

    EmployeesAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hremployee_list, container, false);
        ButterKnife.bind(this, view);

        // pull to refresh
        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> loadData());

        // list view

        if (adapter == null) {
            adapter = new EmployeesAdapter(new ArrayList<>());
            swipeRefreshLayout.setRefreshing(true);
            loadData();
        } else {
            updateEmployeeList();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {

        });

        return view;
    }

    void loadData() {
        new APITask(() -> {
            ArrayList<Employee> employees = new ArrayList<>();
            for (Integer id : AppData.user.getEmployees()) {
                employees.add(MJPApi.shared().getEmployee(id));
            }
            AppData.employees.clear();
            AppData.employees.addAll(employees);
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                swipeRefreshLayout.setRefreshing(false);
                updateEmployeeList();
            }
            @Override
            public void onError(JsonNode errors) {
            }
        }).execute();
    }

    void updateEmployeeList() {
        adapter.clear();
        adapter.addAll(AppData.employees);
    }

    private class EmployeesAdapter extends ArrayAdapter<Employee> {

        public EmployeesAdapter(List<Employee> jobs) {
            super(EmployeeListFragment.this.getContext(), 0, jobs);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {

            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_hr_job_list, parent, false);
            }

//            Job job = getItem(position);
//            AppHelper.showJobInfo(job, convertView);
            return convertView;
        }

    }
}
