package com.myjobpitch.fragments;

import android.content.Context;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class WorkplaceDetailsFragment extends BaseFragment {

    @BindView(R.id.location_info)
    View infoView;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.edit_button)
    ImageButton editButton;

    @BindView(R.id.remove_button)
    ImageButton removeButton;

    @BindView(R.id.list_container)
    View listContainer;
    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.job_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    @BindView(R.id.first_create_text)
    View firstCreateMessage;

    private JobAdapter adapter;

    public boolean isFirstCreate = false;
    public Workplace location;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_workplace_details, container, false);
        ButterKnife.bind(this, view);

        // header view

        title = "Work Place Details";
        navTitleView.setText("Jobs");

        // empty view

        AppHelper.setEmptyViewText(emptyView, "You have not added any\njobs yet.");
        AppHelper.setEmptyButtonText(emptyView, "Create job");

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.greenColor, R.color.yellowColor);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                if (loading == null) {
                    loadJobs();
                }
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
                JobDetailsFragment fragment = new JobDetailsFragment();
                fragment.job = adapter.getItem(position);
                getApp().pushFragment(fragment);
            }
        });

        showLoading(view);
        new APITask(new APIAction() {
            @Override
            public void run() {
                location = MJPApi.shared().getUserWorkplace(location.getId());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                AppHelper.showWorkplaceInfo(location, infoView);
                swipeRefreshLayout.setRefreshing(true);

                if (location.getBusiness_data().getRestricted()) {
                    removeButton.setBackgroundColor(Color.parseColor("#7f4900"));
                    removeButton.setColorFilter(Color.parseColor("#7d7d7d"));
                    removeButton.setEnabled(false);
                    editButton.setBackgroundColor(Color.parseColor("#008074"));
                    editButton.setColorFilter(Color.parseColor("#808080"));
                    editButton.setEnabled(false);
                }

                loadJobs();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

        return  view;
    }

    void loadJobs() {
        final List<Job> jobs = new ArrayList<>();
        new APITask(new APIAction() {
            @Override
            public void run() {
                jobs.addAll(MJPApi.shared().getUserJobs(location.getId()));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(jobs);
                updatedJobList();
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    @OnClick(R.id.edit_button)
    void onEditWorkplace() {
        WorkplaceEditFragment fragment = new WorkplaceEditFragment();
        fragment.location = location;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.remove_button)
    void onRemoveWorkplace() {
        new Popup(getContext())
                .setMessage("Are you sure you want to delete " + location.getName())
                .addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        int jobCount = location.getJobs().size();
                        if (jobCount == 0) {
                            deleteWorkplaceAction();
                            return;
                        }

                        new Popup(getContext())
                                .setMessage("Deleting this workplace will also delete " + jobCount + " jobs. If you want to hide the jobs instead you can deactive them.")
                                .addYellowButton("Delete", new View.OnClickListener() {
                                    @Override
                                    public void onClick(View view) {
                                        deleteWorkplaceAction();
                                    }
                                })
                                .addGreyButton("Cancel", null)
                                .show();
                    }
                })
                .addGreyButton("Cancel", null)
                .show();
    }

    private void deleteWorkplaceAction() {
        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() {
                MJPApi.shared().deleteWorkplace(location.getId());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                getApp().popFragment();
            }

            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    private void updatedJobList() {
        adapter.closeAllItems();

        int jobCount = adapter.getCount();
        AppHelper.getItemSubTitleView(infoView).setText("Includes " + jobCount + (jobCount > 1 ? " jobs" : " job"));
        firstCreateMessage.setVisibility(isFirstCreate ? View.VISIBLE : View.GONE);
        emptyView.setVisibility(isFirstCreate || jobCount>0 ? View.GONE : View.VISIBLE);
    }

    private void deleteJob(final Job job) {
        new Popup(getContext())
                .setMessage("Are you sure you want to delete " + job.getTitle())
                .addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        showLoading(listContainer);
                        new APITask(new APIAction() {
                            @Override
                            public void run() {
                                MJPApi.shared().deleteJob(job.getId());
                            }
                        }).addListener(new APITaskListener() {
                            @Override
                            public void onSuccess() {
                                hideLoading();
                                adapter.remove(job);
                                updatedJobList();
                            }
                            @Override
                            public void onError(JsonNode errors) {
                                errorHandler(errors);
                            }
                        }).execute();

                    }
                })
                .addGreyButton("Cancel", null)
                .show();
    }

    @OnClick(R.id.nav_right_button)
    void onAddJob() {
        isFirstCreate = false;
        JobEditFragment fragment = new JobEditFragment();
        fragment.workplace = location;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        onAddJob();
    }

    @OnClick(R.id.first_create_text)
    void onClickFirstCreateView() {
        onAddJob();
    }

    // job adapter ========================================

    private class JobAdapter extends MJPArraySwipeAdapter<Job> {

        public JobAdapter(Context context, List<Job> jobs) {
            super(context, jobs);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.job_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_job_list_swipe, parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {
            Job job = getItem(position);
            AppHelper.showJobInfo(adapter.getItem(position), convertView);

            if (job.getStatus() == JobStatus.OPEN_ID) {
                convertView.setAlpha(1);
                convertView.setBackgroundColor(0xFFFFFFFF);
                TextView textView = AppHelper.getItemTitleView(convertView);
                textView.setPaintFlags(textView.getPaintFlags() & (-1 ^ Paint.STRIKE_THRU_TEXT_FLAG));
                textView = AppHelper.getItemSubTitleView(convertView);
                textView.setPaintFlags(textView.getPaintFlags() & (-1 ^ Paint.STRIKE_THRU_TEXT_FLAG));
            } else {
                convertView.setAlpha(0.5f);
                convertView.setBackgroundColor(0xFFE1E1E1);
                TextView textView = AppHelper.getItemTitleView(convertView);
                textView.setPaintFlags(textView.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
                textView = AppHelper.getItemSubTitleView(convertView);
                textView.setPaintFlags(textView.getPaintFlags() | Paint.STRIKE_THRU_TEXT_FLAG);
            }

            AppHelper.getEditButton(convertView).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    closeItem(position);

                    JobEditFragment fragment = new JobEditFragment();
                    fragment.job = getItem(position);
                    getApp().pushFragment(fragment);
                }
            });
            AppHelper.getRemoveButton(convertView).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    deleteJob(getItem(position));
                }
            });
        }

    }

}