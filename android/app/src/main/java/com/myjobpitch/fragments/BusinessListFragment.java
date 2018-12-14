package com.myjobpitch.fragments;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.content.ContextCompat;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Image;
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

public class BusinessListFragment extends BaseFragment {

    @BindView(R.id.view_header)
    View headerView;
    @BindView(R.id.header_image)
    ImageView headerImageView;

    @BindView(R.id.nav_title)
    TextView naveTitleView;
    @BindView(R.id.nav_right_button)
    ImageButton addButton;

    @BindView(R.id.list_container)
    View listContainer;
    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.business_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    private MenuItem addMenuItem;
    private BusinessesAdapter adapter;
    private boolean canCreateBusinesses;
    private boolean isAddMode = false;
    private boolean isUserMode = false;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_list, container, false);
        ButterKnife.bind(this, view);

        isUserMode = getApp().getCurrentMenuID() == R.id.menu_users;

        canCreateBusinesses = (AppData.user.getCan_create_businesses() && !isUserMode);
        isAddMode = (getApp().getCurrentMenuID() != R.id.menu_business && !isUserMode);


        // header view

        if (isUserMode) {

            title = getString(R.string.select_business);
            headerView.setVisibility(View.GONE);
            emptyView.setVisibility(View.GONE);

        } else {
            if (isAddMode) {
                title = getString(R.string.add_job);
                headerImageView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
                naveTitleView.setText(getString(R.string.select_business));
                emptyView.setVisibility(View.GONE);
            } else {
                title = getString(R.string.businesses_title);
                headerView.setVisibility(View.GONE);
                addMenuItem = addMenuItem(MENUGROUP1, 100, getString(R.string.add_business), R.drawable.ic_add);
                addMenuItem.setVisible(false);
            }
        }

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            swipeRefreshLayout.setRefreshing(false);
            if (loading == null) {
                loadBusinesses();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new BusinessesAdapter(getApp(), new ArrayList<>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            if (isUserMode) {
                if (adapter.getItem(position).getRestricted()) {
                    Popup popup = new Popup(getContext(), R.string.administrator_message, true);
                    popup.addGreyButton(R.string.ok, null);
                    popup.show();
                } else {
                    BusinessUserListFragment fragment = new BusinessUserListFragment();
                    fragment.business = adapter.getItem(position);
                    fragment.businessName = adapter.getItem(position).getName();
                    getApp().pushFragment(fragment);
                }
            } else {
                BusinessDetailFragment fragment = new BusinessDetailFragment();
                fragment.businessId = adapter.getItem(position).getId();

                getApp().pushFragment(fragment);
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadBusinesses();

        return view;
    }

    void loadBusinesses() {
        final List<Business> businesses = new ArrayList<>();
        new APITask(() -> businesses.addAll(MJPApi.shared().getUserBusinesses())).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(businesses);
                updatedBusinessList();
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    private void updatedBusinessList() {
        adapter.closeAllItems();

        int count = adapter.getCount();

        if (isUserMode) {

            emptyView.setVisibility(count == 0 ? View.VISIBLE : View.GONE);
            if (count == 0) {
                AppHelper.setEmptyViewText(emptyView,  getString(R.string.business_user_empty_message));
                emptyView.findViewById(R.id.empty_button).setVisibility(View.GONE);
            }

        } else {

            if (isAddMode) {
                addButton.setVisibility(canCreateBusinesses ? View.VISIBLE : View.GONE);
                return;
            }


            addMenuItem.setVisible(count == 0 || canCreateBusinesses);
            emptyView.setVisibility(count == 0 || !canCreateBusinesses ? View.VISIBLE : View.GONE);
            if (count == 0) {
                AppHelper.setEmptyViewText(emptyView, R.string.businesses_empty_message1);
                AppHelper.setEmptyButtonText(emptyView, R.string.create_business);
            } else if (!canCreateBusinesses) {
                AppHelper.setEmptyViewText(emptyView, R.string.businesses_empty_message2);
                AppHelper.setEmptyButtonText(emptyView, R.string.contact_us);
            }
        }

    }

    private void deleteBusiness(final Business business) {
        Popup popup = new Popup(getContext(), String.format(getString(R.string.remove_message), business.getName()), true);
        popup.addYellowButton(R.string.delete, view -> {
            int locationCount = business.getLocations().size();
            if (locationCount == 0) {
                deleteBusinessAction(business);
                return;
            }

            Popup popup1 = new Popup(getContext(), String.format(getString(R.string.business_remove_message1), locationCount), true);
            popup1.addYellowButton(R.string.delete, view1 -> deleteBusinessAction(business));
            popup1.addGreyButton(R.string.cancel, null);
            popup1.show();
        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    private void deleteBusinessAction(final Business business) {
        showLoading(listContainer);
        new APITask(() -> {
            MJPApi.shared().deleteBusiness(business.getId());
            AppData.user = MJPApi.shared().getUser();
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                adapter.remove(business);
                updatedBusinessList();
            }

            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.nav_right_button)
    void onClickAddButton() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        if (adapter.getCount() == 0) {
            onClickAddButton();
        } else {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(Uri.parse("mailto:support@myjobpitch.com"));
            startActivity(intent);
        }
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            onClickAddButton();
        }
    }

    // business adapter ========================================

    private class BusinessesAdapter extends MJPArraySwipeAdapter<Business> {

        public BusinessesAdapter(Context context, List<Business> businesses) {
            super(context, businesses);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return isUserMode ? R.id.user_list_item : R.id.job_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate((isUserMode ? R.layout.cell_user_list_swipe : R.layout.cell_job_list_swipe), parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {


            ImageButton editButton = AppHelper.getEditButton(convertView);
            ImageButton removeButton = AppHelper.getRemoveButton(convertView);

            Business business = getItem(position);

            if (isUserMode) {
                // business name
                AppHelper.getItemTitleView(convertView).setText(business.getName());

                // location count
                int userCount = business.getUsers().size();
                AppHelper.getItemSubTitleView(convertView).setText(String.format("%d %s", userCount, getString(userCount > 1 ? R.string.users : R.string.user)));

                editButton.setVisibility(View.GONE);
                removeButton.setVisibility(View.GONE);

            } else {
                // logo
                Image logo = AppHelper.getBusinessLogo(business);
                if (logo != null) {
                    AppHelper.loadImage(logo.getThumbnail(), convertView);
                } else {
                    AppHelper.getImageView(convertView).setImageResource(R.drawable.default_logo);
                }

                // business name
                AppHelper.getItemTitleView(convertView).setText(business.getName());

                // location count
                int locationCount = business.getLocations().size();
                if (locationCount > 1) {
                    AppHelper.getItemSubTitleView(convertView).setText(String.format(getString(R.string.includes_workplaces), locationCount));
                } else {
                    AppHelper.getItemSubTitleView(convertView).setText(String.format(getString(R.string.includes_workplace), locationCount));
                }

                // credit count
                int creditCount = business.getTokens();
                AppHelper.getItemAttributesView(convertView).setText(creditCount + (creditCount > 1 ? getString(R.string.credits) : getString(R.string.credits)));

                if (isAddMode) {
                    editButton.setVisibility(View.GONE);
                    removeButton.setVisibility(View.GONE);
                } else {
                    editButton.setOnClickListener(view -> {
                        closeItem(position);
                        BusinessEditFragment fragment = new BusinessEditFragment();
                        fragment.business = getItem(position);
                        getApp().pushFragment(fragment);
                    });
                    if (AppData.user.getBusinesses().size() > 1) {
                        removeButton.setVisibility(View.VISIBLE);
                        removeButton.setOnClickListener(view -> deleteBusiness(getItem(position)));
                    } else {
                        removeButton.setVisibility(View.GONE);
                    }

                    if (getItem(position).getRestricted()) {
                        editButton.setVisibility(View.GONE);
                        removeButton.setVisibility(View.GONE);
                    }
                 }
            }
        }

    }

}
