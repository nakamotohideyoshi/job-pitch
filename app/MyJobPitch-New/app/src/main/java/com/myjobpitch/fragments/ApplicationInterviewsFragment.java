package com.myjobpitch.fragments;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationInterview;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ApplicationInterviewsFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.interview_list)
    ListView listView;

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @BindView(R.id.empty_view)
    View emptyView;

    JobSeeker jobSeeker;

    public Application application;
    public Integer interviewId;

    private ApplicationInterviewAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_interview_list, container, false);
        ButterKnife.bind(this, view);

        title = "Interviews";

        // empty view

        AppHelper.setEmptyViewText(emptyView, "No Completed and Cancelled Interview List");
        AppHelper.setEmptyButtonText(emptyView, "Refresh");

        emptyView.setVisibility(View.GONE);


        AppHelper.setJobTitleViewText(jobTitleView, "Completed and Cancelled Interview List");

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadInterviews();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new ApplicationInterviewAdapter(getApp(), new ArrayList<ApplicationInterview>());
        } else {
            adapter.clear();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {

            }
        });

        if (AppData.user.isJobSeeker()) {
            addMenuItem(MENUGROUP1, 112, "Edit Profile", R.drawable.ic_edit);
        }

        onRefresh();
        return view;
    }

    private void loadInterviews() {
        final List<ApplicationInterview> interviews = new ArrayList();
        for (int i = 0; i<application.getInterviews().size(); i++) {
            if (application.getInterviews().get(i).getId().intValue() != interviewId) {
                interviews.add(application.getInterviews().get(i));
            }
        }


        adapter.clear();

        for (int i=0; i<interviews.size(); i++) {
            adapter.add(interviews.get(i));
        }
        adapter.closeAllItems();
        swipeRefreshLayout.setRefreshing(false);
    }

    @OnClick(R.id.empty_button)
    void onRefresh() {
        swipeRefreshLayout.setRefreshing(true);
        loadInterviews();
    }

    // job adapter ========================================

    private class ApplicationInterviewAdapter extends MJPArraySwipeAdapter<ApplicationInterview> {

        public ApplicationInterviewAdapter(Context context, List<ApplicationInterview> interviews) {
            super(context, interviews);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.interview_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_application_interview_list, parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {

            AppHelper.showApplicationInterviewInfo(getItem(position), convertView, application);

        }

    }
}
