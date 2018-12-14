package com.myjobpitch.pages.hr.jobs;

import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.pages.hr.employees.HREmployeeEditFragment;
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

public class HRJobListFragment extends BaseFragment {


    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;

    @BindView(R.id.list_view)
    ListView listView;

    EmptyView emptyView;
    HRJobsAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hrjob_list, container, false);
        ButterKnife.bind(this, view);

        title = "HR Jobs";
        addMenuItem(MENUGROUP1, 100, "Add", R.drawable.ic_add);

        // pull to refresh
        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> loadData());

        // list view

        if (adapter == null) {
            adapter = new HRJobsAdapter(new ArrayList<>());
            swipeRefreshLayout.setRefreshing(true);
            loadData();
        } else {
            updateJobList();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> editHRJob(adapter.getItem(position)));

        return view;
    }

    void loadData() {
        new APITask(() -> {
            List<Location> workplaces = MJPApi.shared().getUserLocations(null);
            AppData.workplaces.clear();
            AppData.workplaces.addAll(workplaces);

            List<HRJob> hrJobs = MJPApi.shared().getHRJobs();
            AppData.hrJobs.clear();
            AppData.hrJobs.addAll(hrJobs);
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                swipeRefreshLayout.setRefreshing(false);
                updateJobList();
            }
            @Override
            public void onError(JsonNode errors) {
            }
        }).execute();
    }

    void updateJobList() {
        adapter.clear();
        adapter.addAll(AppData.hrJobs);
        adapter.closeAllItems();

        if (AppData.hrJobs.size() == 0) {
            if (emptyView == null) {
                emptyView = new EmptyView(getApp())
                        .setText(R.string.hr_job_list_empty_text)
                        .setButton(R.string.hr_job_list_empty_button, v -> addHRJob())
                        .show((ViewGroup)getView());
            }
        } else {
            if (emptyView != null) {
                emptyView.dismiss();
                emptyView = null;
            }
        }
    }

    public void addHRJob() {
        editHRJob(null);
    }

    void editHRJob(HRJob hrJob) {
        HRJobEditFragment fragment = new HRJobEditFragment();
        fragment.hrJob = hrJob;
        getApp().pushFragment(fragment);
    }

    void removeHRJob(HRJob hrJob) {
        Popup popup = new Popup(getContext(), "Are you sure you want to delete this job?", true);
        popup.addYellowButton(R.string.delete, view -> {
            showLoading();
            new APITask(() -> MJPApi.shared().deleteHRJob(hrJob.getId()))
                    .addListener(new APITaskListener() {
                        @Override
                        public void onSuccess() {
                            hideLoading();
                            AppData.hrJobs.remove(hrJob);
                            updateJobList();
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
            BaseFragment fragment = new HRJobEditFragment();
            getApp().pushFragment(fragment);
        }
    }

    private class HRJobsAdapter extends MJPArraySwipeAdapter<HRJob> {

        public HRJobsAdapter(List<HRJob> hrJobs) {
            super(HRJobListFragment.this.getContext(), hrJobs);
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_hr_job_list, parent, false);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.hr_job_list_item;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            HRJob job = getItem(position);
            Location workplace = AppData.getObjById(AppData.workplaces, job.getLocation());
            ((TextView) convertView.findViewById(R.id.title)).setText(job.getTitle());
            ((TextView) convertView.findViewById(R.id.subtitle)).setText(workplace.getName());

            AppHelper.getRemoveButton(convertView).setOnClickListener(view -> removeHRJob(getItem(position)));
        }
    }
}
