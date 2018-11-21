package com.myjobpitch.pages.hr.jobs;

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
import com.myjobpitch.api.data.HRJob;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.EmptyView;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class HRJobListFragment extends BaseFragment {


    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;

    @BindView(R.id.list_view)
    ListView listView;

    EmptyView mEmptyView;

    HRJobsAdapter mAdapter;

    HRJobViewModel mViewModel;

    List<Workplace> mWorkplaces;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hrjob_list, container, false);
        ButterKnife.bind(this, view);

        // list view

        mAdapter = new HRJobListFragment.HRJobsAdapter(getContext(), new ArrayList<>());

        listView.setAdapter(mAdapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            Intent intent = new Intent(getContext(), HRJobEditActivity.class);
            startActivityForResult(intent, 1000);
        });

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.greenColor, R.color.yellowColor);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            mViewModel.clearHRJobs();
            loadData();
        });

        mViewModel = ViewModelProviders.of(this).get(HRJobViewModel.class);
        loadData();

        return view;
    }

    void loadData() {
        swipeRefreshLayout.setRefreshing(true);
        mViewModel.getHRJobs().observe(this, hrJobs -> {
            mWorkplaces = mViewModel.getWorkplaces();
            swipeRefreshLayout.setRefreshing(false);

            if (hrJobs.size() == 0) {
                if (mEmptyView == null) {
                    mEmptyView = new EmptyView(getApp())
                            .setText(R.string.hr_job_list_empty_text)
                            .setButton(R.string.hr_job_list_empty_button, v -> addHRJob())
                            .show((ViewGroup)getView());
                }

            } else {
                if (mEmptyView != null) {
                    mEmptyView.dismiss();
                    mEmptyView = null;
                }
            }

            mAdapter.clear();
            mAdapter.addAll(hrJobs);
            mAdapter.closeAllItems();
        });
    }

    public void addHRJob() {

    }

    private class HRJobsAdapter extends MJPArraySwipeAdapter<HRJob> {

        public HRJobsAdapter(Context context, List<HRJob> hrJobs) {
            super(context, hrJobs);
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
            Workplace workplace = AppData.getObjById(mWorkplaces, job.getLocation());
            ((TextView) convertView.findViewById(R.id.title)).setText(job.getTitle());
            ((TextView) convertView.findViewById(R.id.subtitle)).setText(workplace.getName());
        }
    }
}
