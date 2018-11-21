package com.myjobpitch.pages.hr.employees;

import android.arch.lifecycle.ViewModelProviders;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.data.HREmployee;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.utils.MJPArraySwipeAdapter;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class HREmployeeListFragment extends BaseFragment {


    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;

    @BindView(R.id.list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;
    @BindView(R.id.empty_text)
    TextView emptyText;
    @BindView(R.id.empty_button)
    TextView emptyButton;

    HREmployeesAdapter adapter;

    HREmployeeViewModel mViewModel;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hremployee_list, container, false);
        ButterKnife.bind(this, view);

        // list view

        adapter = new HREmployeeListFragment.HREmployeesAdapter(getContext(), new ArrayList<>());

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            Intent intent = new Intent(getContext(), HREmployeeEditActivity.class);
            startActivityForResult(intent, 1000);
        });

        // empty view

        emptyText.setText(R.string.hr_employee_list_empty_text);
        emptyButton.setText(R.string.hr_employee_list_empty_button);
        emptyButton.setOnClickListener(v -> addHREmployee());

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.greenColor, R.color.yellowColor);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            mViewModel.clearHREmployees();
            loadData();
        });

        mViewModel = ViewModelProviders.of(this).get(HREmployeeViewModel.class);
        loadData();

        return view;
    }

    void loadData() {
        swipeRefreshLayout.setRefreshing(true);
        mViewModel.getHREmployees().observe(this, hrEmployees -> {
            swipeRefreshLayout.setRefreshing(false);
            emptyView.setVisibility(hrEmployees.size() > 0 ? View.GONE : View.VISIBLE);

            adapter.clear();
            adapter.addAll(hrEmployees);
            adapter.closeAllItems();
        });
    }

    public void addHREmployee() {

    }

    private class HREmployeesAdapter extends MJPArraySwipeAdapter<HREmployee> {

        public HREmployeesAdapter(Context context, List<HREmployee> hrEmployees) {
            super(context, hrEmployees);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.user_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_user_list_swipe, parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {
            HREmployee employee = getItem(position);
            ((TextView) convertView.findViewById(R.id.item_title)).setText(employee.getFirst_name() + " " + employee.getLast_name());
        }
    }
}
