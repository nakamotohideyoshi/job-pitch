package com.myjobpitch.fragments;

import android.content.Context;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
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

public class InterviewsFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.interview_list)
    ListView listView;

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @BindView(R.id.empty_view)
    View emptyView;

    JobSeeker jobSeeker;

    public Job job;
    public List<Application> applications;

    private InterviewAdapter adapter;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_interview_list, container, false);
        ButterKnife.bind(this, view);

        title = "Interviews";

        // empty view

        AppHelper.setEmptyViewText(emptyView, "No Interviews");
        AppHelper.setEmptyButtonText(emptyView, "Refresh");

        if (AppData.user.isRecruiter()) {
            AppHelper.setJobTitleViewText(jobTitleView, String.format("%s, (%s)", job.getTitle(), AppHelper.getBusinessName(job)));
        } else {
            AppHelper.setJobTitleViewText(jobTitleView, "");
        }

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadApplications();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new InterviewAdapter(getApp(), new ArrayList<Interview>());
        } else {
            adapter.clear();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                InterviewDetailFragment fragment = new InterviewDetailFragment();
                fragment.interviewId = adapter.getItem(position).getId();

                for (int i=0; i<applications.size(); i++) {
                    if (adapter.getItem(position).getApplication().intValue() == applications.get(i).getId().intValue()) {
                        fragment.application = applications.get(i);
                        getApp().pushFragment(fragment);
                        break;
                    }
                }

            }
        });

        if (AppData.user.isJobSeeker()) {
            addMenuItem(MENUGROUP1, 112, "Edit Profile", R.drawable.ic_edit);
        }

        onRefresh();

        return view;
    }

    private void loadApplications() {
        applications = new ArrayList();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                String query = job == null ? null : "job=" + job.getId();
                applications.addAll(MJPApi.shared().get(Application.class, query));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                loadInterviews();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    private void loadInterviews() {
        final List<Interview> interviews = new ArrayList();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                interviews.addAll(MJPApi.shared().getAllInterviews());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                Boolean isEmpty = true;
                List<Integer> applicationIds = new ArrayList<>();
                for (int i=0; i<applications.size(); i++) {

                    if (AppData.user.isRecruiter()) {
                        applicationIds.add(applications.get(i).getId());
                    } else {
                        if (applications.get(i).getJobSeeker().getId().intValue() == AppData.user.getJob_seeker().intValue()) {
                            applicationIds.add(applications.get(i).getId());
                        }
                    }
                }

                for (int i=0; i<interviews.size(); i++) {
                    if (applicationIds.contains(interviews.get(i).getApplication()) && interviews.get(i).getCancelled() == null) {
                        adapter.add(interviews.get(i));
                        isEmpty = false;
                    }
                }
                adapter.closeAllItems();

                emptyView.setVisibility(isEmpty ? View.VISIBLE : View.GONE);
                swipeRefreshLayout.setRefreshing(false);

            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.empty_button)
    void onRefresh() {
        swipeRefreshLayout.setRefreshing(true);
        loadApplications();
    }

    // job adapter ========================================

    private class InterviewAdapter extends MJPArraySwipeAdapter<Interview> {

        public InterviewAdapter(Context context, List<Interview> interviews) {
            super(context, interviews);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.interview_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_interview_list, parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {

            for (int i=0; i<applications.size(); i++) {
                if (getItem(position).getApplication().intValue() == applications.get(i).getId().intValue()) {
                    AppHelper.showInterviewInfo(getItem(position), convertView, applications.get(i));
                    break;
                }
            }
        }

    }
}
