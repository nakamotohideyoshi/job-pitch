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

        isUserMode = getApp().getCurrentPageID() == AppData.PAGE_USERS;

        canCreateBusinesses = (AppData.user.getCan_create_businesses() && !isUserMode);
        isAddMode = (getApp().getCurrentPageID() != AppData.PAGE_ADD_JOB && !isUserMode);


        // header view

        if (isUserMode) {

            title = "Choose Business";
            headerView.setVisibility(View.GONE);
            emptyView.setVisibility(View.GONE);

        } else {
            if (isAddMode) {
                title = "Add job";
                headerImageView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
                naveTitleView.setText("Select business");
                emptyView.setVisibility(View.GONE);
            } else {
                title = "Businesses";
                headerView.setVisibility(View.GONE);
                addMenuItem = addMenuItem(MENUGROUP1, 100, "Add", R.drawable.ic_add);
                addMenuItem.setVisible(false);
            }
        }

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                swipeRefreshLayout.setRefreshing(false);
                if (loading == null) {
                    loadBusinesses();
                }
            }
        });

        // list view

        if (adapter == null) {
            adapter = new BusinessesAdapter(getApp(), new ArrayList<Business>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (isUserMode) {
                    BusinessUserListFragment fragment = new BusinessUserListFragment();
                    fragment.businessId = adapter.getItem(position).getId();
                    fragment.businessName = adapter.getItem(position).getName();
                    getApp().pushFragment(fragment);
                } else {
                    BusinessDetailFragment fragment = new BusinessDetailFragment();
                    fragment.businessId = adapter.getItem(position).getId();

                    getApp().pushFragment(fragment);
                }
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadBusinesses();

        return view;
    }

    void loadBusinesses() {
        final List<Business> businesses = new ArrayList<>();
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                businesses.addAll(MJPApi.shared().getUserBusinesses());
            }
        }).addListener(new APITaskListener() {
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
                AppHelper.setEmptyViewText(emptyView, "You are not an administrator of any businesses");
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
                AppHelper.setEmptyViewText(emptyView, "Hi, Welcome to My Job Pitch\nLet's start by easily adding your business!");
                AppHelper.setEmptyButtonText(emptyView, "Create business");
            } else if (!canCreateBusinesses) {
                AppHelper.setEmptyViewText(emptyView, "Got more that one business?\nGet in touch to talk about how we can help you.\nRemember, you can always create additional workplaces under your existing business.");
                AppHelper.setEmptyButtonText(emptyView, "Contact Us");
            }
        }

    }

    private void deleteBusiness(final Business business) {
        Popup popup = new Popup(getContext(), "Are you sure you want to delete " + business.getName(), true);
        popup.addYellowButton("Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                int locationCount = business.getLocations().size();
                if (locationCount == 0) {
                    deleteBusinessAction(business);
                    return;
                }

                Popup popup = new Popup(getContext(), "Deleting this business will also delete " + locationCount + " workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.", true);
                popup.addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        deleteBusinessAction(business);
                    }
                });
                popup.addGreyButton("Cancel", null);
                popup.show();
            }
        });
        popup.addGreyButton("Cancel", null);
        popup.show();
    }

    private void deleteBusinessAction(final Business business) {
        showLoading(listContainer);
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                MJPApi.shared().deleteBusiness(business.getId());
                AppData.user = MJPApi.shared().getUser();
            }
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

            if (isUserMode) {
                AppHelper.showBusinessInfo1(getItem(position), convertView);
                editButton.setVisibility(View.GONE);
                removeButton.setVisibility(View.GONE);

            } else {
                AppHelper.showBusinessInfo(getItem(position), convertView);
                if (isAddMode) {
                    editButton.setVisibility(View.GONE);
                    removeButton.setVisibility(View.GONE);
                } else {
                    editButton.setOnClickListener(new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            closeItem(position);
                            BusinessEditFragment fragment = new BusinessEditFragment();
                            fragment.business = getItem(position);
                            getApp().pushFragment(fragment);
                        }
                    });
                    if (AppData.user.getBusinesses().size() > 1) {
                        removeButton.setVisibility(View.VISIBLE);
                        removeButton.setOnClickListener(new View.OnClickListener() {
                            @Override
                            public void onClick(View view) {
                                deleteBusiness(getItem(position));
                            }
                        });
                    } else {
                        removeButton.setVisibility(View.GONE);
                    }
                }
            }
        }

    }

}
