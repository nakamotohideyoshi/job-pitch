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

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
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

public class BusinessListFragment extends BaseFragment {

    @BindView(R.id.view_header)
    View headerView;
    @BindView(R.id.header_image)
    ImageView headerImageView;

    @BindView(R.id.nav_title)
    TextView naveTitleView;
    @BindView(R.id.nav_right_button)
    ImageButton addButton;

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.business_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    private boolean canCreateBusinesses;
    private MenuItem addMenuItem;
    private BusinessesAdapter adapter;

    public boolean addJobMode = false;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_list, container, false);
        ButterKnife.bind(this, view);

        canCreateBusinesses = AppData.user.getCan_create_businesses();

        // header view

        if (addJobMode) {
            title = "Add job";
            headerImageView.setColorFilter(ContextCompat.getColor(getApp(), R.color.colorGreen));
            naveTitleView.setText("Select business");
        } else {
            title = "Businesses";
            headerView.setVisibility(View.GONE);

            addMenuItem = addMenuItem("Add", R.drawable.ic_add);
            addMenuItem.setVisible(false);
        }

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                loadBusinesses();
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
                BusinessDetailFragment fragment = new BusinessDetailFragment();
                fragment.addJobMode = addJobMode;
                fragment.businessId = adapter.getItem(position).getId();
                getApp().pushFragment(fragment);
            }
        });

        // loading data

        swipeRefreshLayout.setRefreshing(true);
        loadBusinesses();

        return view;
    }

    private void loadBusinesses() {
        new APITask(this) {
            private List<Business> businesses;
            @Override
            protected void runAPI() throws MJPApiException {
                businesses = MJPApi.shared().getUserBusinesses();
            }
            @Override
            protected void onSuccess() {
                adapter.clear();
                adapter.addAll(businesses);
                updatedBusinessList();
                swipeRefreshLayout.setRefreshing(false);
            }
        };
    }

    private void updatedBusinessList() {
        adapter.closeAllItems();

        if (addJobMode) {
            addButton.setVisibility(View.VISIBLE);
        } else {
            addMenuItem.setVisible(true);
        }

        if (adapter.getCount() == 0) {
            emptyView.setVisibility(View.VISIBLE);
            AppHelper.setEmptyViewText(emptyView, "You have not added any\nbusinesses yet.");
            AppHelper.setEmptyButtonText(emptyView, "Create business");
        } else if (!canCreateBusinesses) {
            if (addJobMode) {
                addButton.setVisibility(View.GONE);
                emptyView.setVisibility(View.GONE);
            } else {
                addMenuItem.setVisible(false);
                emptyView.setVisibility(View.VISIBLE);
                AppHelper.setEmptyViewText(emptyView, "Have more than one company?\nGet in touch!");
                AppHelper.setEmptyButtonText(emptyView, "sales@myjobpitch.com");
            }
        } else {
            emptyView.setVisibility(View.GONE);
        }
    }

    private void deleteBusiness(final Business business) {
        Popup.showYellow("Are you sure you want to delete " + business.getName(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", BusinessListFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteBusiness(business.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        adapter.remove(business);
                        updatedBusinessList();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    @OnClick(R.id.nav_right_button)
    void onClickAddButton() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        if (canCreateBusinesses || adapter.getCount() == 0) {
            onClickAddButton();
        } else {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            Uri data = Uri.parse("mailto:sales@myjobpitch.com");
            intent.setData(data);
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
            return R.id.job_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            View view = LayoutInflater.from(getContext()).inflate(R.layout.cell_job_list_swipe, parent, false);

            boolean canRemove = canCreateBusinesses && AppData.user.getBusinesses().size() > 1;
            AppHelper.getRemoveButton(view).setVisibility(canRemove ? View.VISIBLE : View.GONE);
            return view;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            AppHelper.showBusinessInfo(getItem(position), convertView);

            if (addJobMode) {
                AppHelper.getEditButton(convertView).setVisibility(View.GONE);
                AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
            } else {
                AppHelper.getEditButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        closeItem(position);

                        BusinessEditFragment fragment = new BusinessEditFragment();
                        fragment.business = getItem(position);
                        getApp().pushFragment(fragment);
                    }
                });
                AppHelper.getRemoveButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        deleteBusiness(getItem(position));
                    }
                });
            }

        }

    }

}
