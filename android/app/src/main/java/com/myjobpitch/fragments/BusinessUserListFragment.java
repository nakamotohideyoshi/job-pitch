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
import com.myjobpitch.api.data.BusinessUser;
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

public class BusinessUserListFragment extends BaseFragment {



    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.user_list)
    ListView listView;
    @BindView(R.id.job_title_view)
    View jobTitleView;
    @BindView(R.id.empty_view)
    View emptyView;
    @BindView(R.id.empty_text)
    TextView emptyText;
    @BindView(R.id.empty_button)
    TextView emptyButton;

    private MenuItem addMenuItem;
    private BusinessesUserAdapter adapter;

    public String businessName;
    public Business business;
    public List<Location> locations;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_user_list, container, false);
        ButterKnife.bind(this, view);

        title = getString(R.string.users_title);

        AppHelper.setJobTitleViewText(jobTitleView, businessName);

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.colorGreen, R.color.colorYellow);
        swipeRefreshLayout.setOnRefreshListener(() -> {
            swipeRefreshLayout.setRefreshing(false);
            if (loading == null) {
                loadBusinessUsers();
            }
        });

        // list view

        if (adapter == null) {
            adapter = new BusinessesUserAdapter(getApp(), new ArrayList<>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            if (adapter.getItem(position).getUser() != AppData.user.getId().intValue()) {
                BusinessUserEditFragment fragment = new BusinessUserEditFragment();
                fragment.isEditMode = true;
                fragment.businessUser = adapter.getItem(position);
                fragment.businessId = business.getId();
                fragment.locations = locations;
                getApp().pushFragment(fragment);
            } else {
                Popup popup = new Popup(getContext(), R.string.cannt_edit_current_user, true);
                popup.addGreyButton(R.string.ok, null);
                popup.show();
            }
        });

        if (business.getRestricted()) {
            swipeRefreshLayout.setRefreshing(false);
            emptyView.setVisibility(View.VISIBLE);
            emptyText.setText(R.string.administrator_message);
            emptyButton.setVisibility(View.GONE);
        } else {
            swipeRefreshLayout.setRefreshing(true);
            addMenuItem(MENUGROUP1, 115, getString(R.string.create_user), R.drawable.ic_add);
            // loading data
            loadWorkplaces();
        }

        return view;
    }

    @OnClick(R.id.empty_button)
    void createUser(){
        BusinessUserEditFragment fragment = new BusinessUserEditFragment();
        fragment.isEditMode = false;
        fragment.businessId = business.getId();
        fragment.locations = locations;
        getApp().pushFragment(fragment);
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 115) {
            createUser();
        } else {
            super.onMenuSelected(menuID);
        }
    }

    void loadWorkplaces() {
        locations = new ArrayList<>();
        new APITask(() -> locations.addAll(MJPApi.shared().getUserLocations(business.getId()))).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {

                loadBusinessUsers();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void loadBusinessUsers() {
        final List<BusinessUser> businessUsers = new ArrayList<>();
        new APITask(() -> businessUsers.addAll(MJPApi.shared().getBusinessUsers(business.getId()))).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(businessUsers);
                if (businessUsers.size() == 0) {
                    emptyView.setVisibility(View.VISIBLE);
                    emptyText.setText(R.string.business_user_empty_message);
                    emptyButton.setText(R.string.create_user);
                }
                updatedBusinessUserList();
                swipeRefreshLayout.setRefreshing(false);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

    private void updatedBusinessUserList() {
        adapter.closeAllItems();

    }

    // business adapter ========================================

    private class BusinessesUserAdapter extends MJPArraySwipeAdapter<BusinessUser> {

        public BusinessesUserAdapter(Context context, List<BusinessUser> businessUsers) {
            super(context, businessUsers);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.user_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            return LayoutInflater.from(getContext()).inflate(R.layout.cell_user_list_swipe, parent, false);
        }

        @Override
        public void fillValues(final int position, View convertView) {
            BusinessUser businessUser = getItem(position);

            // email
            AppHelper.getItemTitleView(convertView).setText(businessUser.getEmail());

            // location
            int locationCount = businessUser.getLocations().size();
            String subTitle = locationCount == 0 ? getString(R.string.administrator) : "";

            if (businessUser.getUser() == AppData.user.getId().intValue()) {
                subTitle = getString(R.string.administrator_current);
            }

            for (int i=0; i<locations.size(); i++) {
                if (businessUser.getLocations().indexOf(locations.get(i).getId()) > -1) {
                    if (subTitle == "") {
                        subTitle = locations.get(i).getName();
                    } else {
                        subTitle = subTitle + ", " + locations.get(i).getName();
                    }
                }
            }

            AppHelper.getItemSubTitleView(convertView).setText(subTitle);
        }

    }

}
