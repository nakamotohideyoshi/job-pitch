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

        // empty view

        AppHelper.setEmptyViewText(emptyView, "No Interviews");
        AppHelper.setEmptyButtonText(emptyView, "Refresh");

        AppHelper.setJobTitleViewText(jobTitleView, String.format("%s, (%s)", job.getTitle(), AppHelper.getBusinessName(job)));

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

            }
        });

        if (AppData.user.isJobSeeker()) {
            addMenuItem(MENUGROUP1, 112, "Edit Profile", R.drawable.ic_edit);
        }

        if (jobSeeker != null) {
            showInactiveBanner();
        }

        onRefresh();

        return view;
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 109) {
            getApp().setRootFragement(AppData.PAGE_MESSAGES);
        } else if (menuID == 112) {
            TalentProfileFragment fragment = new TalentProfileFragment();
            fragment.jobSeeker = jobSeeker;
            fragment.isActivation = true;
            getApp().pushFragment(fragment);
        } else {
            super.onMenuSelected(menuID);
        }
    }

    void showInactiveBanner() {
        if (!jobSeeker.isActive()) {
            AppHelper.setJobTitleViewText(jobTitleView, "Your Profile is not Activate");
        } else {
            AppHelper.setJobTitleViewText(jobTitleView, "");
        }
    }

    private void loadApplications() {
        applications = new ArrayList();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                String query = "job=" + job.getId();
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
                    applicationIds.add(applications.get(i).getId());
                }

                for (int i=0; i<interviews.size(); i++) {
                    if (applicationIds.contains(interviews.get(i).getApplication())) {
                        adapter.add(interviews.get(i));
                        isEmpty = false;
                    }
                }
                adapter.closeAllItems();

                emptyView.setVisibility(isEmpty ? View.VISIBLE : View.GONE);
                swipeRefreshLayout.setRefreshing(false);

                if (AppData.user.isJobSeeker()) {
                    showInactiveBanner();
                    showNewMessagesCounts();
                }
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }


    void showNewMessagesCounts() {
        long newMessageCount = getApp().newMessageCount;
        if (newMessageCount > 0 && newMessageCount < 10) {
            int id = getResources().getIdentifier("com.myjobpitch:drawable/menu_message" + getApp().newMessageCount,null, null);
            addMenuItem(MENUGROUP1, 109, "All Messages", id);
        } else if (newMessageCount >= 10) {
            addMenuItem(MENUGROUP1, 109, "All Messages", R.drawable.menu_message10);
        }
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
                    AppHelper.showInterviewInfo(getItem(position), convertView, applications.get(i), job);
                    break;
                }
            }
        }

    }
}
