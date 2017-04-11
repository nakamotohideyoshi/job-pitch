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

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.utils.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LocationDetailFragment extends BaseFragment {

    @BindView(R.id.location_info)
    View infoView;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.job_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    private JobAdapter adapter;

    public Location location;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_location_detail, container, false);
        ButterKnife.bind(this, view);

        // header view

        title = "Work Place Detail";
        navTitleView.setText("Jobs");

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
                JobDetailFragment fragment = new JobDetailFragment();
                fragment.job = adapter.getItem(position);
                getApp().pushFragment(fragment);
            }
        });

        // loaidng data

        view.setVisibility(View.INVISIBLE);
        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                location = MJPApi.shared().getUserLocation(location.getId());
            }
            @Override
            protected void onSuccess() {
                view.setVisibility(View.VISIBLE);
                AppHelper.showLocationInfo(location, infoView);
                swipeRefreshLayout.setRefreshing(true);
                loadJobs();
            }
        };

        return  view;
    }

    @OnClick(R.id.edit_button)
    void onEditLocation() {
        LocationEditFragment fragment = new LocationEditFragment();
        fragment.location = location;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.remove_button)
    void onRemoveLocation() {
        Popup.showYellow("Are you sure you want to delete " + location.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", LocationDetailFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteLocation(location.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        getApp().popFragment();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    private void loadJobs() {

        new APITask(null, this) {
            private List<Job> jobs = new ArrayList<>();
            @Override
            protected void runAPI() throws MJPApiException {
                jobs = MJPApi.shared().getUserJobs(location.getId());
            }
            @Override
            protected void onSuccess() {
                adapter.clear();
                adapter.addAll(jobs);
                updatedJobList();
                swipeRefreshLayout.setRefreshing(false);
            }
        };

    }

    private void updatedJobList() {
        adapter.closeAllItems();
        emptyView.setVisibility(adapter.getCount()==0 ? View.VISIBLE : View.GONE);
        int jobCount = adapter.getCount();
        AppHelper.getItemSubTitleView(infoView).setText("Includes " + jobCount + (jobCount > 1 ? " jobs" : " job"));
    }

    private void deleteJob(final Job job) {
        Popup.showYellow("Are you sure you want to delete " + job.getTitle(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", LocationDetailFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteJob(job.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        adapter.remove(job);
                        updatedJobList();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    @OnClick(R.id.nav_right_button)
    void onAddJob() {
        JobEditFragment fragment = new JobEditFragment();
        fragment.location = location;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
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
            AppHelper.showJobInfo(adapter.getItem(position), convertView);

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
