package com.myjobpitch.fragments;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageLoader;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.utils.Popup;
import com.myjobpitch.utils.ResultListener;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessDetailFragment extends BaseFragment {

    @BindView(R.id.business_info)
    View infoView;

    @BindView(R.id.remove_button_disable)
    ImageButton removeButtonDisable;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.location_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    LocationAdapter adapter;
    List<Location> locations = new ArrayList<>();

    public static boolean requestReloadLocations;
    public static Location selectedLocation;

    public BusinessDetailFragment() {
        requestReloadLocations = true;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_detail, container, false);
        ButterKnife.bind(this, view);

        // header view

        title = "Business Detail";
        navTitleView.setText("Locations");

        if (!AppData.user.getCan_create_businesses()) {
            removeButtonDisable.setVisibility(View.VISIBLE);
        }

        showInfo(BusinessListFragment.selectedBusiness, infoView);

        // empty view

        AppHelper.setEmptyViewText(emptyView, "You have not added any\nlocations yet.");
        AppHelper.setEmptyButtonText(emptyView, "Create location");

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
            adapter = new LocationAdapter(getApp(), locations);
        } else {
            adapter.closeAllItems();
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                selectedLocation = adapter.getItem(position);
                LocationDetailFragment fragment = new LocationDetailFragment();
                getApp().pushFragment(fragment);
            }
        });

        if (requestReloadLocations) {
            swipeRefreshLayout.setRefreshing(true);
            loadLocations();
        } else {
            emptyView.setVisibility(locations.size()==0 ? View.VISIBLE : View.GONE);
        }

        return  view;
    }

    void loadLocations() {
        requestReloadLocations = false;
        new AsyncTask<Void, Void, List<Location>>() {
            @Override
            protected List<Location> doInBackground(Void... params) {
                try {
                    return MJPApi.shared().getUserLocations(BusinessListFragment.selectedBusiness.getId());
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Location> data) {

                swipeRefreshLayout.setRefreshing(false);

                if (data != null) {
                    adapter.clear();
                    adapter.addAll(data);
                    adapter.closeAllItems();
                    locations = data;
                    emptyView.setVisibility(locations.size()==0 ? View.VISIBLE : View.GONE);
                }
            }
        }.execute();
    }

    @OnClick(R.id.edit_button)
    void onEditBusiness() {
        editBusiness(BusinessListFragment.selectedBusiness);
    }

    @OnClick(R.id.remove_button)
    void onRemoveBusiness() {
        deleteBusiness(BusinessListFragment.selectedBusiness, new ResultListener() {
            @Override
            public void done(Object result) {
                getApp().popFragment();
            }
        });
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        LocationDetailFragment.editLocation(null);
    }

    @OnClick(R.id.nav_right_button)
    void onAddLocation() {
        LocationDetailFragment.editLocation(null);
    }

    // location adapter ========================================

    class LocationAdapter extends MJPArraySwipeAdapter<Location> {

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
            LocationDetailFragment.showInfo(adapter.getItem(position), convertView);

            // edit swipe button
            convertView.findViewById(R.id.edit_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    LocationDetailFragment.editLocation(getItem(position));
                }
            });

            // remove swipe button
            convertView.findViewById(R.id.remove_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    LocationDetailFragment.deleteLocation(getItem(position), new ResultListener() {
                        @Override
                        public void done(Object result) {
                            showInfo(BusinessListFragment.selectedBusiness, infoView);
                            loadLocations();
                        }
                    });
                }
            });
        }

    }

    // business info ========================================

    public static void showInfo(Business business, View view) {

        // logo

        if (business.getImages().size() > 0) {
            new ImageLoader(business.getImages().get(0).getThumbnail(), view, null);
        } else {
            ImageLoader.setImage(view, R.drawable.default_logo);
        }

        // business name

        TextView titleView = (TextView)view.findViewById(R.id.item_title);
        titleView.setText(business.getName());

        // location count

        int locationCount = business.getLocations().size();
        TextView subtitleView = (TextView)view.findViewById(R.id.item_subtitle);
        subtitleView.setText("Includes " + locationCount + (locationCount > 1 ? " work places" : " work place"));

        // credit count

        int creditCount = business.getTokens();
        TextView creditsView = (TextView)view.findViewById(R.id.item_attributes);
        creditsView.setText(creditCount + (creditCount > 1 ? " credits" : " credit"));

    }

    // business edit ========================================

    public static void editBusiness(Business business) {
        BusinessListFragment.selectedBusiness = business;
        BusinessEditFragment fragment = new BusinessEditFragment();
        MainActivity.instance.pushFragment(fragment);
    }

    public static void deleteBusiness(final Business business, final ResultListener listener) {

        Popup.showYellow("Are you sure you want to delete " + business.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AppHelper.showLoading("Deleting...");
                new AsyncTask<Void, Void, Boolean>() {
                    @Override
                    protected Boolean doInBackground(Void... params) {
                        try {
                            MJPApi.shared().deleteBusiness(business.getId());
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
