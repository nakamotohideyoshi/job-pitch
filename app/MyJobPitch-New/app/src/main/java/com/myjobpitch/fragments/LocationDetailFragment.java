package com.myjobpitch.fragments;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageLoader;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.utils.Popup;
import com.myjobpitch.utils.ResultListener;

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

    JobAdapter adapter;
    List<Job> jobs = new ArrayList<>();

    public static boolean requestReloadJobs;
    public static Job selectedJob;

    public LocationDetailFragment() {
        requestReloadJobs = true;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_location_detail, container, false);
        ButterKnife.bind(this, view);

        // header view

        title = "Work Place Detail";
        navTitleView.setText("Jobs");

        showInfo(BusinessDetailFragment.selectedLocation, infoView);

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
        } else {
            adapter.closeAllItems();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                selectedJob = adapter.getItem(position);
                JobDetailFragment fragment = new JobDetailFragment();
                getApp().pushFragment(fragment);
            }
        });

        if (requestReloadJobs) {
            swipeRefreshLayout.setRefreshing(true);
            loadJobs();
        } else {
            emptyView.setVisibility(jobs.size()==0 ? View.VISIBLE : View.GONE);
        }

        return  view;
    }

    void loadJobs() {
        requestReloadJobs = false;
        new AsyncTask<Void, Void, List<Job>>() {
            @Override
            protected List<Job> doInBackground(Void... params) {
                try {
                    return MJPApi.shared().getUserJobs(BusinessDetailFragment.selectedLocation.getId());
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Job> data) {

                swipeRefreshLayout.setRefreshing(false);

                if (data != null) {
                    adapter.clear();
                    adapter.addAll(data);
                    adapter.closeAllItems();
                    jobs = data;
                    emptyView.setVisibility(jobs.size()==0 ? View.VISIBLE : View.GONE);
                }
            }
        }.execute();
    }

    @OnClick(R.id.edit_button)
    void onEditLocation() {
        editLocation(BusinessDetailFragment.selectedLocation);
    }

    @OnClick(R.id.remove_button)
    void onRemoveLocation() {
        deleteLocation(BusinessDetailFragment.selectedLocation, new ResultListener() {
            @Override
            public void done(Object result) {
                getApp().popFragment();
            }
        });
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        JobDetailFragment.editJob(null);
    }

    @OnClick(R.id.nav_right_button)
    void onAddJob() {
        JobDetailFragment.editJob(null);
    }

    // job adapter ========================================

    class JobAdapter extends MJPArraySwipeAdapter<Job> {

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
            JobDetailFragment.showInfo(adapter.getItem(position), convertView);

            // edit swipe button
            convertView.findViewById(R.id.edit_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    JobDetailFragment.editJob(getItem(position));
                }
            });

            // remove swipe button
            convertView.findViewById(R.id.remove_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    JobDetailFragment.deleteJob(getItem(position), new ResultListener() {
                        @Override
                        public void done(Object result) {
                            showInfo(BusinessDetailFragment.selectedLocation, infoView);
                            loadJobs();
                        }
                    });
                }
            });
        }

    }

    // location info ========================================

    public static void showInfo(Location location, View view) {

        // logo

        if (location.getImages().size() > 0) {
            new ImageLoader(location.getImages().get(0).getThumbnail(), view, null);
        } else {
            Business business = location.getBusiness_data();
            if (business.getImages().size() > 0) {
                new ImageLoader(business.getImages().get(0).getThumbnail(), view, null);
            } else {
                ImageLoader.setImage(view, R.drawable.default_logo);
            }
        }

        // location name

        TextView titleView = (TextView)view.findViewById(R.id.item_title);
        titleView.setText(location.getName());

        // job count

        int jobCount = location.getJobs().size();
        TextView subtitleView = (TextView)view.findViewById(R.id.item_subtitle);
        subtitleView.setText("Includes " + jobCount + (jobCount > 1 ? " jobs" : " job"));

        view.findViewById(R.id.item_attributes).setVisibility(View.GONE);

    }

    // location edit ========================================

    public static void editLocation(Location location) {
        BusinessDetailFragment.selectedLocation = location;
        LocationEditFragment fragment = new LocationEditFragment();
        MainActivity.instance.pushFragment(fragment);
    }

    public static void deleteLocation(final Location location, final ResultListener listener) {

        Popup.showYellow("Are you sure you want to delete " + location.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AppHelper.showLoading("Deleting...");
                new AsyncTask<Void, Void, Boolean>() {
                    @Override
                    protected Boolean doInBackground(Void... params) {
                        try {
                            MJPApi.shared().deleteLocation(location.getId());
                            BusinessListFragment.selectedBusiness = MJPApi.shared().get(Business.class, BusinessListFragment.selectedBusiness.getId());
                            return true;
                        } catch (MJPApiException e) {
                            Popup.showGreen(e.getMessage(), null, null, "OK", null, true);
                            return false;
                        }
                    }
                    @Override
                    protected void onPostExecute(Boolean success) {
                        if (success) {
                            AppHelper.hideLoading();
                            BusinessListFragment.requestReloadBusinesses = true;
                            BusinessDetailFragment.requestReloadLocations = true;
                            if (listener != null) {
                                listener.done(null);
                            }
                        }
                    }
                }.execute();
            }
        }, "Cancel", null, true);

    }

}
