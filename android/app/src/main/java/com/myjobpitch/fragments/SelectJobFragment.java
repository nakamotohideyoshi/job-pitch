package com.myjobpitch.fragments;

import android.content.Context;
import android.graphics.Paint;
import android.os.Bundle;
import android.os.Handler;
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

        jobActiveStatus = JobStatus.OPEN_ID;

        // set header

        pageIconView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
        pageIconView.setImageDrawable(getApp().getCurrentMenu().getIcon());

        final int pageId = getApp().getCurrentMenuID();
        switch (pageId) {
            case R.id.menu_find_talent:
                commentView.setText(R.string.find_talent_comment);
                break;
            case R.id.menu_applications:
                commentView.setText(R.string.application_comment);
                break;
            case R.id.menu_connections:
                commentView.setText(R.string.connection_comment);
                break;
            case R.id.menu_shortlist:
                commentView.setText(R.string.shortlist_comment);
                break;
            case R.id.menu_rc_interview:
                commentView.setText(R.string.interview_comment);
                break;
        }

        navTitleView.setText(R.string.select_job);

        // empty view

        AppHelper.setEmptyViewText(emptyView, R.string.select_job_empty_text);
        AppHelper.setEmptyButtonText(emptyView, R.string.create_job);

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> loadJobs());

        // list view

        if (adapter == null) {
            adapter = new JobAdapter(getApp(), new ArrayList<>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            Job job = adapter.getItem(position);
            if (pageId == R.id.menu_find_talent) {
                FindTalentFragment fragment = new FindTalentFragment();
                fragment.job = job;
                getApp().pushFragment(fragment);
            } else if (pageId == R.id.menu_rc_interview) {
                InterviewsFragment fragment = new InterviewsFragment();
                fragment.job = job;
                fragment.title = title;
                getApp().pushFragment(fragment);
            } else {
                RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                fragment.job = job;
                fragment.listKind = pageId - R.id.menu_applications;
                getApp().pushFragment(fragment);
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadJobs();

        return view;
    }

    void loadJobs() {
        final List<Job> jobs = new ArrayList<>();

        new APITask(() -> {
            List<Job> data = MJPApi.shared().getUserJobs(null);
            for(int i=0; i<data.size(); i++) {
                Job job = data.get(i);
                if (job.getStatus() == jobActiveStatus) {
                    jobs.add(job);
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

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 107) {
            getApp().setRootFragement(R.id.menu_messages);
        } else {
            super.onMenuSelected(menuID);
        }
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
