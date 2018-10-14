package com.myjobpitch.fragments;

import android.content.Context;
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

public class ApplicationsFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.application_list)
    ListView listView;

    @BindView(R.id.job_title_view)
    View jobTitleView;

    @BindView(R.id.empty_view)
    View emptyView;

    JobSeeker jobSeeker;

    private ApplicationAdapter adapter;
    private int applyButtonIcon;
    private int cellLayout;

    protected View initView(LayoutInflater inflater, ViewGroup container, int applyButtonIcon, String emptyText, int cellLayout) {
        this.applyButtonIcon = applyButtonIcon;
        this.cellLayout = cellLayout;

        View view = inflater.inflate(R.layout.fragment_application_list, container, false);
        ButterKnife.bind(this, view);

        // empty view

        AppHelper.setEmptyViewText(emptyView, emptyText);
        AppHelper.setEmptyButtonText(emptyView, "Refresh");

        AppHelper.setJobTitleViewText(jobTitleView, "");

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
            adapter = new ApplicationAdapter(getApp(), new ArrayList<Application>());
        } else {
            adapter.clear();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                selectedApplication(adapter.getItem(position));
            }
        });

        if (AppData.user.isJobSeeker()) {
            addMenuItem(MENUGROUP2, 100, "Edit Profile", R.drawable.ic_edit);
        }

        if (jobSeeker != null) {
            showInactiveBanner();
        }

        onRefresh();

        return view;
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
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
            AppHelper.setJobTitleViewText(jobTitleView, "Your profile is not active!");
        } else {
            AppHelper.setJobTitleViewText(jobTitleView, "");
        }
    }


    private void loadApplications() {
        final List<Application> applications = new ArrayList();
        new APITask(new APIAction() {
            @Override
            public void run() {
                applications.addAll(getApplications());
                if (AppData.user.isJobSeeker()) {
                    jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(applications);
                adapter.closeAllItems();
                emptyView.setVisibility(applications.size()==0 ? View.VISIBLE : View.GONE);
                swipeRefreshLayout.setRefreshing(false);

                if (AppData.user.isJobSeeker()) {
                    showInactiveBanner();
                }
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

    private class ApplicationAdapter extends MJPArraySwipeAdapter<Application> {

        public ApplicationAdapter(Context context, List<Application> applications) {
            super(context, applications);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.application_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            View view = LayoutInflater.from(getContext()).inflate(cellLayout, parent, false);
            AppHelper.getEditButton(view).setImageResource(applyButtonIcon);
            return view;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            showApplicationInfo(getItem(position), convertView);

            AppHelper.getEditButton(convertView).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    applyItem(getItem(position));
                }
            });

            AppHelper.getRemoveButton(convertView).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    removeItem(getItem(position));
                }
            });
        }

    }

    protected void setItemTitle(View view, String text) {
        ((TextView) view.findViewById(R.id.item_title)).setText(text);
    }

    protected void setItemSubTitle(View view, String text) {
        ((TextView) view.findViewById(R.id.item_subtitle)).setText(text);
    }

    protected void setItemAttributes(View view, String text) {
        ((TextView) view.findViewById(R.id.item_attributes)).setText(text);
    }

    protected void setItemDesc(View view, String text) {
        ((TextView) view.findViewById(R.id.item_desc)).setText(text);
    }

    // override method ========================================

    protected List<Application> getApplications() {
        return new ArrayList<>();
    }

    protected void showApplicationInfo(Application application, View view) {
    }

    protected void selectedApplication(Application application) {
    }

    protected void applyItem(Application application) {
    }

    protected void removeItem(Application application) {
    }

}
