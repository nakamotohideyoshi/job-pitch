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
import com.myjobpitch.api.data.InterviewStatus;
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
                for (Application application : applications) {
                    if (adapter.getItem(position).getApplication().intValue() == application.getId().intValue()) {
                        fragment.application = application;
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
        adapter.clear();
        Boolean isEmpty = true;

        for (Application application : applications) {

            if (application.getMessages().size() != 0) {
                Boolean isOpenInterview = false;
                for (Interview interview : application.getInterviews()) {
                    if (interview.getStatus().equals(InterviewStatus.PENDING) || interview.getStatus().equals(InterviewStatus.ACCEPTED)) {
                        interview.setApplication(application.getId());
                        adapter.add(interview);
                        isOpenInterview = true;
                        isEmpty = false;
                        break;
                    }
                }
                if (!isOpenInterview) {
                    List<Interview> interviewList = application.getInterviews();
                    if (interviewList.size() != 0) {
                        Interview interview = interviewList.get(interviewList.size() - 1);
                        interview.setApplication(application.getId());
                        adapter.add(interview);
                        isEmpty = false;
                    }

                }
            }
        }

        adapter.closeAllItems();

        emptyView.setVisibility(isEmpty ? View.VISIBLE : View.GONE);
        swipeRefreshLayout.setRefreshing(false);
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
            for (Application application : applications) {
                if (getItem(position).getApplication().intValue() == application.getId().intValue()) {
                    AppHelper.showInterviewInfo(getItem(position), convertView, application);
                    break;
                }
            }
        }

    }
}
