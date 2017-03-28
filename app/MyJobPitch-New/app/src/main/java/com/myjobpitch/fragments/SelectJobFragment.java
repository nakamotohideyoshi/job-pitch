package com.myjobpitch.fragments;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class SelectJobFragment extends BaseFragment {

    @BindView(R.id.image_view)
    ImageView pageIconView;

    @BindView(R.id.header_title)
    TextView titleView;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.job_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    JobAdapter adapter;
    List<Job> jobs = new ArrayList<>();

    Integer jobActiveStatus;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_select_job, container, false);
        ButterKnife.bind(this, view);

        // set header

        MainActivity.MenuItemInfo menuItemInfo = getApp().getCurrentPageMenuInfo();

        pageIconView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
        pageIconView.setImageResource(menuItemInfo.iconRes);

        final int pageId = getApp().getCurrentPageID();
        switch (pageId) {
            case AppData.PAGE_FIND_TALENT:
                titleView.setText("Select job bellow to start finding talent for your business.");
                break;
            case AppData.PAGE_R_APPLICATIONS:
                titleView.setText("comment here.");
                break;
            case AppData.PAGE_CONNECTIONS:
                titleView.setText("comment here.");
                break;
            case AppData.PAGE_MY_SHORTLIST:
                titleView.setText("comment here.");
                break;
        }

        navTitleView.setText("Select a Job");

        // empty view

        AppHelper.setEmptyViewText(emptyView, "You have not added any\njobs yet.");
        AppHelper.setEmptyButtonText(emptyView, "Create job");

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadJobs();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new JobAdapter(getApp(), jobs);
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Job job = adapter.getItem(position);
                if (job.getStatus() == jobActiveStatus) {
                    if (pageId == AppData.PAGE_FIND_TALENT) {
                        FindTalentFragment fragment = new FindTalentFragment();
                        fragment.job = job;
                        getApp().pushFragment(fragment);
                    } else {
                        RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                        fragment.job = job;
                        if (pageId == AppData.PAGE_R_APPLICATIONS) {
                            fragment.listKind = RecruiterApplicationsFragment.APPLICATIONS;
                        } else if (pageId == AppData.PAGE_CONNECTIONS) {
                            fragment.listKind = RecruiterApplicationsFragment.CONNECTIONS;
                        } else {
                            fragment.listKind = RecruiterApplicationsFragment.MY_SHORTLIST;
                        }
                        getApp().pushFragment(fragment);
                    }
                }
            }
        });

        swipeRefreshLayout.setRefreshing(true);
        loadJobs();

        jobActiveStatus = AppData.get(JobStatus.class, "OPEN").getId();

        return view;
    }

    void loadJobs() {
        new AsyncTask<Void, Void, List<Job>>() {
            @Override
            protected List<Job> doInBackground(Void... params) {
                try {
                    return MJPApi.shared().getUserJobs(null);
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Job> data) {
                swipeRefreshLayout.setRefreshing(false);
                if (data != null) {
                    jobs = data;
                    adapter.clear();
                    adapter.addAll(jobs);
                    emptyView.setVisibility(jobs.size()==0 ? View.VISIBLE : View.GONE);
                }
            }
        }.execute();
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        getApp().setRootFragement(AppData.PAGE_ADD_JOB);
    }

    @OnClick(R.id.nav_right_button)
    void onAddJob() {
        getApp().setRootFragement(AppData.PAGE_ADD_JOB);
    }

    // job adapter ========================================

    class JobAdapter extends ArrayAdapter<Job> {

        public JobAdapter(Context context, List<Job> jobs) {
            super(context, 0, jobs);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {

            if(convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_job_list, parent, false);
            }

            Job job = getItem(position);
            JobDetailFragment.showInfo(job, convertView);
            convertView.setAlpha(job.getStatus() == jobActiveStatus ? 1 : 0.5f);

            return convertView;
        }

    }

}
