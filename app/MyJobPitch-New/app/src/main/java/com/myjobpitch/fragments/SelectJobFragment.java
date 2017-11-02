package com.myjobpitch.fragments;

import android.content.Context;
import android.graphics.Paint;
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

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import org.springframework.util.CollectionUtils;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class SelectJobFragment extends BaseFragment {

    @BindView(R.id.image_view)
    ImageView pageIconView;
    @BindView(R.id.header_comment)
    TextView commentView;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.job_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    private Integer jobActiveStatus;
    private JobAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_select_job, container, false);
        ButterKnife.bind(this, view);

        jobActiveStatus = AppData.get(JobStatus.class, "OPEN").getId();

        // set header

        MainActivity.MenuItemInfo menuItemInfo = getApp().getCurrentPageMenuInfo();

        pageIconView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
        pageIconView.setImageResource(menuItemInfo.iconRes);

        final int pageId = getApp().getCurrentPageID();
        switch (pageId) {
            case AppData.PAGE_FIND_TALENT:
                commentView.setText("Select job bellow to start finding talent for your business.");
                break;
            case AppData.PAGE_R_APPLICATIONS:
                commentView.setText("Select a job below to view job seekers who have expressed interest in a job.");
                break;
            case AppData.PAGE_CONNECTIONS:
                commentView.setText("Select a job below to view job seekers you have connected with.");
                break;
            case AppData.PAGE_MY_SHORTLIST:
                commentView.setText("Select a job below to view the job seekers you have shortlisted for that role.");
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
            adapter = new JobAdapter(getApp(), new ArrayList<Job>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Job job = adapter.getItem(position);
                if (pageId == AppData.PAGE_FIND_TALENT) {
                    FindTalentFragment fragment = new FindTalentFragment();
                    fragment.job = job;
                    getApp().pushFragment(fragment);
                } else {
                    RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                    fragment.job = job;
                    fragment.listKind = pageId - AppData.PAGE_R_APPLICATIONS;
                    getApp().pushFragment(fragment);
                }
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadJobs();

        return view;
    }

    void loadJobs() {
        final List<Job> jobs = new ArrayList<>();

        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                List<Job> data = MJPApi.shared().getUserJobs(null);
                for(int i=0; i<data.size(); i++) {
                    Job job = data.get(i);
                    if (job.getStatus() == jobActiveStatus) {
                        jobs.add(job);
                    }
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(jobs);
                emptyView.setVisibility(jobs.size()==0 ? View.VISIBLE : View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    @OnClick(R.id.nav_right_button)
    void onAddJob() {
        if (AppData.user.getCan_create_businesses() || AppData.user.getBusinesses().size()==0) {
            BusinessListFragment fragment = new BusinessListFragment();
            getApp().pushFragment(fragment);
        } else {
            BusinessDetailFragment fragment = new BusinessDetailFragment();
            fragment.businessId = AppData.user.getBusinesses().get(0);
            getApp().pushFragment(fragment);
        }
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        onAddJob();
    }

    // job adapter ========================================

    private class JobAdapter extends ArrayAdapter<Job> {

        public JobAdapter(Context context, List<Job> jobs) {
            super(context, 0, jobs);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {

            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_job_list, parent, false);
            }

            Job job = getItem(position);
            AppHelper.showJobInfo(job, convertView);
            return convertView;
        }

    }

}
