
package com.myjobpitch.pages.employees;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Employee;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.tasks.APIAction;
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
    @BindView(R.id.list)
    ListView listView;

    private EmployeeListFragment.EmployeesAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hrjob_list, container, false);
        ButterKnife.bind(this, view);

        title = "Employees";

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.greenColor, R.color.yellowColor);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadData();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new EmployeeListFragment.EmployeesAdapter(getApp(), new ArrayList<Employee>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Employee employee = adapter.getItem(position);
                EmployeeDetailsFragment fragment = new EmployeeDetailsFragment();
                fragment.employee = employee;
                getApp().pushFragment(fragment);
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadData();

        return view;
    }

    void loadData() {
        final List<Employee> employees = new ArrayList<>();

        new APITask(new APIAction() {
            @Override
            public void run() {
                for(Integer id : AppData.user.getEmployees()) {
                    Employee employee = MJPApi.shared().get(Employee.class, id);
                    employees.add(employee);
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(employees);
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    // business adapter ========================================

    private class EmployeesAdapter extends ArrayAdapter<Employee> {

        public EmployeesAdapter(Context context, List<Employee> employees) {
            super(context, 0, employees);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {

            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_user_list, parent, false);
            }

            Employee employee = getItem(position);
            ((TextView) convertView.findViewById(R.id.item_title)).setText(employee.getJob().getTitle());
            convertView.findViewById(R.id.item_subtitle).setVisibility(View.GONE);
            return convertView;
        }
    }

}
