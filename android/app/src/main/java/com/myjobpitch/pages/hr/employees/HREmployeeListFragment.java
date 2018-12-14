package com.myjobpitch.pages.hr.employees;

import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.HREmployee;
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.pages.hr.jobs.HRJobEditFragment;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.EmptyView;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class HREmployeeListFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;

    @BindView(R.id.list_view)
    ListView listView;

    EmptyView emptyView;
    HREmployeesAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hremployee_list, container, false);
        ButterKnife.bind(this, view);

        title = "HR Employees";
        addMenuItem(MENUGROUP1, 100, "Add", R.drawable.ic_add);

        // pull to refresh
        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> loadData());

        // list view

        if (adapter == null) {
            adapter = new HREmployeesAdapter(new ArrayList<>());
            swipeRefreshLayout.setRefreshing(true);
            loadData();
        } else {
            updateEmployeeList();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> editHREmployee(adapter.getItem(position)));

        return view;
    }

    void loadData() {
        new APITask(() -> {
            List<HREmployee> hrEmployees = MJPApi.shared().getHREmployees();
            AppData.hrEmployees.clear();
            AppData.hrEmployees.addAll(hrEmployees);

            List<HRJob> hrJobs = MJPApi.shared().getHRJobs();
            AppData.hrJobs.clear();
            AppData.hrJobs.addAll(hrJobs);
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
        adapter.addAll(AppData.hrEmployees);
        adapter.closeAllItems();

        if (AppData.hrEmployees.size() == 0) {
            if (emptyView == null) {
                emptyView = new EmptyView(getApp())
                        .setText(R.string.hr_employee_list_empty_text)
                        .setButton(R.string.hr_employee_list_empty_button, v -> addHREmployee())
                        .show((ViewGroup)getView());
            }
        } else {
            if (emptyView != null) {
                emptyView.dismiss();
                emptyView = null;
            }
        }
    }

    public void addHREmployee() {
        editHREmployee(null);
    }

    void editHREmployee(HREmployee hrEmployee) {
        HREmployeeEditFragment fragment = new HREmployeeEditFragment();
        fragment.hrEmployee = hrEmployee;
        getApp().pushFragment(fragment);
    }

    void removeHREmployee(HREmployee hrEmployee) {
        Popup popup = new Popup(getContext(), "Are you sure you want to delete this employee?", true);
        popup.addYellowButton(R.string.delete, view -> {
            showLoading();
            new APITask(() -> MJPApi.shared().deleteHREmployee(hrEmployee.getId()))
                    .addListener(new APITaskListener() {
                        @Override
                        public void onSuccess() {
                            hideLoading();
                            AppData.hrEmployees.remove(hrEmployee);
                            updateEmployeeList();
                        }
                        @Override
                        public void onError(JsonNode errors) {
                            errorHandler(errors);
                        }
                    }).execute();

        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            BaseFragment fragment = new HREmployeeEditFragment();
            getApp().pushFragment(fragment);
        }
    }

    private class HREmployeesAdapter extends MJPArraySwipeAdapter<HREmployee> {

        public HREmployeesAdapter(List<HREmployee> hrJobs) {
            super(HREmployeeListFragment.this.getContext(), hrJobs);
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_job_list_swipe, parent, false);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.job_list_item;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            HREmployee employee = getItem(position);
            if (employee.getProfile_image() != null) {
                AppHelper.loadImage(employee.getProfile_image(), convertView);
            } else {
                AppHelper.getImageView(convertView).setImageResource(R.drawable.default_logo);
            }
            AppHelper.getItemTitleView(convertView).setText(employee.getFirst_name() + " " + employee.getLast_name());
            AppHelper.getItemSubTitleView(convertView).setText(employee.getEmail());
            AppHelper.getItemAttributesView(convertView).setVisibility(View.GONE);

            AppHelper.getRemoveButton(convertView).setOnClickListener(view -> removeHREmployee(getItem(position)));
        }
    }
}
