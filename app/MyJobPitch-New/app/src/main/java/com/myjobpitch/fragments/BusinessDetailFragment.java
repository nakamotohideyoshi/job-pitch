package com.myjobpitch.fragments;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.utils.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessDetailFragment extends BaseFragment {

    @BindView(R.id.business_info)
    View infoView;
    @BindView(R.id.header_comment)
    TextView headerCommentView;

    @BindView(R.id.edit_buttons)
    View editButtonsView;
    @BindView(R.id.remove_button)
    ImageButton removeButton;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.location_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    @BindView(R.id.first_create_text)
    View firstCreateMessage;

    private Business business;
    private LocationAdapter adapter;
    private boolean isAddMode = false;

    public boolean isFirstCreate = false;
    public Integer businessId;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_business_detail, container, false);
        ButterKnife.bind(this, view);

        isAddMode = getApp().getCurrentPageID() != AppData.PAGE_ADD_JOB;

        // header view

        if (isAddMode) {
            title = "Add job";
            AppHelper.getImageView(infoView).setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
            AppHelper.getImageView(infoView).setImageResource(R.drawable.menu_business);
            editButtonsView.setVisibility(View.GONE);
            navTitleView.setText("Select work place");
        } else {
            title = "Business Detail";
            headerCommentView.setVisibility(View.GONE);
            navTitleView.setText("Work Places");
            if (AppData.user.getBusinesses().size() <= 1) {
                removeButton.setBackgroundColor(Color.parseColor("#7f4900"));
                removeButton.setColorFilter(Color.parseColor("#7d7d7d"));
                removeButton.setEnabled(false);
            }
        }

        // empty view

        AppHelper.setEmptyViewText(emptyView, "You have not added any\nwork places yet.");
        AppHelper.setEmptyButtonText(emptyView, "Create work place");

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadLocations();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new LocationAdapter(getApp(), new ArrayList<Location>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Location location = adapter.getItem(position);
                if (isAddMode) {
                    JobEditFragment fragment = new JobEditFragment();
                    fragment.location = location;
                    getApp().pushFragment(fragment);
                } else {
                    LocationDetailFragment fragment = new LocationDetailFragment();
                    fragment.location = location;
                    getApp().pushFragment(fragment);
                }
            }
        });

        // loading data

        view.setVisibility(View.INVISIBLE);
        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                business = MJPApi.shared().getUserBusiness(businessId);
            }
            @Override
            protected void onSuccess() {
                view.setVisibility(View.VISIBLE);
                if (!isAddMode) {
                    AppHelper.showBusinessInfo(business, infoView);
                }
                swipeRefreshLayout.setRefreshing(true);
                loadLocations();
            }
        };

        return  view;
    }

    @OnClick(R.id.edit_button)
    void onEditBusiness() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        fragment.business = business;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.remove_button)
    void onRemoveBusiness() {
        Popup.showYellow("Are you sure you want to delete " + business.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", BusinessDetailFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteBusiness(business.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        getApp().popFragment();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    private void loadLocations() {
        new APITask(null, this) {
            private List<Location> locations;
            @Override
            protected void runAPI() throws MJPApiException {
                locations = MJPApi.shared().getUserLocations(businessId);
            }
            @Override
            protected void onSuccess() {
                adapter.clear();
                adapter.addAll(locations);
                updatedLocationList();
                swipeRefreshLayout.setRefreshing(false);
            }
        };
    }

    private void updatedLocationList() {
        adapter.closeAllItems();

        int locationCount = adapter.getCount();
        if (!isAddMode) {
            AppHelper.getItemSubTitleView(infoView).setText("Includes " + locationCount + (locationCount > 1 ? " work places" : " work place"));
        }
        firstCreateMessage.setVisibility(isFirstCreate ? View.VISIBLE : View.GONE);
        emptyView.setVisibility(isFirstCreate || locationCount>0 ? View.GONE : View.VISIBLE);
    }

    private void deleteLocation(final Location location) {
        Popup.showYellow("Are you sure you want to delete " + location.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", BusinessDetailFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteLocation(location.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        adapter.remove(location);
                        updatedLocationList();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    @OnClick(R.id.nav_right_button)
    void onAddLocation() {
        isFirstCreate = false;
        LocationEditFragment fragment = new LocationEditFragment();
        fragment.business = business;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        onAddLocation();
    }

    @OnClick(R.id.first_create_text)
    void onClickFirstCreateView() {
        onAddLocation();
    }

    // location adapter ========================================

    private class LocationAdapter extends MJPArraySwipeAdapter<Location> {

        public LocationAdapter(Context context, List<Location> locations) {
            super(context, locations);
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
            AppHelper.showLocationInfo(adapter.getItem(position), convertView);

            if (isAddMode) {
                AppHelper.getEditButton(convertView).setVisibility(View.GONE);
                AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
            } else {
                AppHelper.getEditButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        closeItem(position);
                        LocationEditFragment fragment = new LocationEditFragment();
                        fragment.location = getItem(position);
                        getApp().pushFragment(fragment);
                    }
                });
                AppHelper.getRemoveButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        deleteLocation(getItem(position));
                    }
                });
            }
        }

    }

}
