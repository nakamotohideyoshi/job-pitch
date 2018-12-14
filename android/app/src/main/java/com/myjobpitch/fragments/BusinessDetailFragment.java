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

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.Popup;

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

    @BindView(R.id.edit_button)
    ImageButton editButton;

    @BindView(R.id.remove_button)
    ImageButton removeButton;

    @BindView(R.id.nav_right_button)
    ImageButton navRightButton;

    @BindView(R.id.nav_title)
    TextView navTitleView;

    @BindView(R.id.list_container)
    View listContainer;
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
        View view = inflater.inflate(R.layout.fragment_business_detail, container, false);
        ButterKnife.bind(this, view);

        isAddMode = getApp().getCurrentMenuID() != R.id.menu_business;

        // header view

        if (isAddMode) {
            title = getString(R.string.add_job);
            AppHelper.getImageView(infoView).setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
            AppHelper.getImageView(infoView).setImageResource(R.drawable.menu_business);
            editButtonsView.setVisibility(View.GONE);
            navTitleView.setText(R.string.select_workplace);
        } else {
            title = getString(R.string.business_details);
            headerCommentView.setVisibility(View.GONE);
            navTitleView.setText(R.string.workplaces_title);
        }

        // empty view

        AppHelper.setEmptyViewText(emptyView, getString(R.string.empty_workplaces));
        AppHelper.setEmptyButtonText(emptyView, getString(R.string.create_workplace));

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            if (loading == null) {
                loadWorkplaces();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new LocationAdapter(getApp(), new ArrayList<>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
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
        });

        showLoading(view);
        new APITask(() -> business = MJPApi.shared().getUserBusiness(businessId)).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                if (!isAddMode) {
                    // logo
                    Image logo = AppHelper.getBusinessLogo(business);
                    if (logo != null) {
                        AppHelper.loadImage(logo.getThumbnail(), infoView);
                    } else {
                        AppHelper.getImageView(infoView).setImageResource(R.drawable.default_logo);
                    }

                    // business name
                    AppHelper.getItemTitleView(infoView).setText(business.getName());

                    // location count
                    int locationCount = business.getLocations().size();
                    if (locationCount > 1) {
                        AppHelper.getItemSubTitleView(infoView).setText(String.format(getString(R.string.includes_workplaces), locationCount));
                    } else {
                        AppHelper.getItemSubTitleView(infoView).setText(String.format(getString(R.string.includes_workplace), locationCount));
                    }

                    // credit count
                    int creditCount = business.getTokens();
                    AppHelper.getItemAttributesView(infoView).setText(creditCount + (creditCount > 1 ? getString(R.string.credits) : getString(R.string.credits)));

                    if (business.getRestricted()) {
                        disableEditButton();
                        disableRemoveButton();
                        navRightButton.setVisibility(View.GONE);
                    }
                    if (business.getLocations().size() == 1) {
                        disableRemoveButton();
                    }
                }
                swipeRefreshLayout.setRefreshing(true);
                loadWorkplaces();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

        return  view;
    }

    void disableRemoveButton() {
        removeButton.setBackgroundColor(Color.parseColor("#7f4900"));
        removeButton.setColorFilter(Color.parseColor("#7d7d7d"));
        removeButton.setEnabled(false);
    }

    void disableEditButton() {
        editButton.setBackgroundColor(Color.parseColor("#008074"));
        editButton.setColorFilter(Color.parseColor("#808080"));
        editButton.setEnabled(false);
    }

    void loadWorkplaces() {
        final List<Location> locations = new ArrayList<>();
        new APITask(() -> locations.addAll(MJPApi.shared().getUserLocations(businessId))).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(locations);
                updatedLocationList();
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.edit_button)
    void onEditBusiness() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        fragment.business = business;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.remove_button)
    void onRemoveBusiness() {
        Popup popup = new Popup(getContext(), String.format(getString(R.string.remove_message), business.getName()), true);
        popup.addYellowButton(R.string.delete, view -> {
            int locationCount = business.getLocations().size();
            if (locationCount == 0) {
                deleteBusinessAction();
                return;
            }

            Popup popup1 = new Popup(getContext(), String.format(getString(R.string.business_remove_message1), locationCount), true);
            popup1.addYellowButton(R.string.delete, view1 -> deleteBusinessAction());
            popup1.addGreyButton(R.string.cancel, null);
            popup1.show();
        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    void deleteBusinessAction() {
        showLoading();
        new APITask(() -> MJPApi.shared().deleteBusiness(business.getId())).addListener(new APITaskListener() {
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

    private void updatedLocationList() {
        adapter.closeAllItems();

        int locationCount = adapter.getCount();
        if (!isAddMode) {
            if (locationCount > 1) {
                AppHelper.getItemSubTitleView(infoView).setText(String.format(getString(R.string.includes_workplaces), locationCount));
            } else {
                AppHelper.getItemSubTitleView(infoView).setText(String.format(getString(R.string.includes_workplace), locationCount));
            }

        }
        firstCreateMessage.setVisibility(isFirstCreate ? View.VISIBLE : View.GONE);
        emptyView.setVisibility(isFirstCreate || locationCount>0 ? View.GONE : View.VISIBLE);
    }

    private void deleteLocation(final Location location) {
        Popup popup = new Popup(getContext(), String.format(getString(R.string.remove_message), location.getName()), true);
        popup.addYellowButton(getString(R.string.delete), view -> {
            int jobCount = location.getJobs().size();
            if (jobCount == 0) {
                deleteLocationAction(location);
                return;
            }

            Popup popup1 = new Popup(getContext(), String.format(getString(R.string.workplace_remove_message1), jobCount), true);
            popup1.addYellowButton(getString(R.string.delete), view1 -> deleteLocationAction(location));
            popup1.addGreyButton(R.string.cancel, null);
            popup1.show();
        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    private void deleteLocationAction(final Location location) {
        showLoading(listContainer);
        new APITask(() -> MJPApi.shared().deleteLocation(location.getId())).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                adapter.remove(location);
                updatedLocationList();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
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
            Location location = getItem(position);

            // logo
            Image logo = AppHelper.getWorkplaceLogo(location);
            if (logo != null) {
                AppHelper.loadImage(logo.getThumbnail(), convertView);
            } else {
                AppHelper.getImageView(convertView).setImageResource(R.drawable.default_logo);
            }

            // location name
            AppHelper.getItemTitleView(convertView).setText(location.getName());

            // job count
            int jobCount = location.getJobs().size();
            if (jobCount > 1) {
                AppHelper.getItemSubTitleView(convertView).setText(String.format(getString(R.string.includes_jobs), jobCount));
            } else {
                AppHelper.getItemSubTitleView(convertView).setText(String.format(getString(R.string.includes_job), jobCount));
            }

            AppHelper.getItemAttributesView(convertView).setVisibility(View.GONE);

            if (isAddMode) {
                AppHelper.getEditButton(convertView).setVisibility(View.GONE);
                AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
            } else {
                AppHelper.getEditButton(convertView).setOnClickListener(view -> {
                    closeItem(position);
                    LocationEditFragment fragment = new LocationEditFragment();
                    fragment.location = getItem(position);
                    getApp().pushFragment(fragment);
                });
                AppHelper.getRemoveButton(convertView).setOnClickListener(view -> deleteLocation(getItem(position)));
                if (business.getRestricted()) {
                    AppHelper.getEditButton(convertView).setVisibility(View.GONE);
                    AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
                }
                if (business.getLocations().size() == 1) {
                    AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
                }
            }
        }

    }

}
