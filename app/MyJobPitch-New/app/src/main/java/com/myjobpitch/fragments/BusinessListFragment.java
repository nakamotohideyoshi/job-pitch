package com.myjobpitch.fragments;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ListView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.utils.ResultListener;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessListFragment extends BaseFragment {

    @BindView(R.id.swipe_container)
    SwipeRefreshLayout swipeRefreshLayout;
    @BindView(R.id.business_list)
    ListView listView;

    @BindView(R.id.empty_view)
    View emptyView;

    MenuItem addMenuItem;

    BusinessesAdapter adapter;
    List<Business> businesses = new ArrayList<>();

    public static boolean requestReloadBusinesses;
    public static Business selectedBusiness;

    public BusinessListFragment() {
        requestReloadBusinesses = true;
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_list, container, false);
        ButterKnife.bind(this, view);

        title = "Businesses";

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
            adapter = new BusinessesAdapter(getApp(), businesses);
        } else {
            adapter.closeAllItems();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                selectedBusiness = adapter.getItem(position);
                BusinessDetailFragment fragment = new BusinessDetailFragment();
                getApp().pushFragment(fragment);
            }
        });

        // menu item

        Menu menu = getApp().getToolbarMenu();
        addMenuItem = menu.add(Menu.NONE, 100, 1, "Add");
        addMenuItem.setIcon(R.drawable.ic_add);
        addMenuItem.setShowAsAction(MenuItem.SHOW_AS_ACTION_ALWAYS);
        addMenuItem.setVisible(false);

        if (requestReloadBusinesses) {
            swipeRefreshLayout.setRefreshing(true);
            loadBusinesses();
        } else {
            checkEmpty();
        }

        return view;
    }

    void loadBusinesses() {
        requestReloadBusinesses = false;
        new AsyncTask<Void, Void, List<Business>>() {
            @Override
            protected List<Business> doInBackground(Void... params) {
                try {
                    return MJPApi.shared().getUserBusinesses();
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Business> data) {

                swipeRefreshLayout.setRefreshing(false);

                if (data != null) {
                    adapter.clear();
                    adapter.addAll(data);
                    adapter.closeAllItems();
                    businesses = data;
                    checkEmpty();
                }
            }
        }.execute();
    }

    void checkEmpty() {
        if (businesses.size() == 0) {
            emptyView.setVisibility(View.VISIBLE);
            AppHelper.setEmptyViewText(emptyView, "You have not added any\nbusinesses yet.");
            AppHelper.setEmptyButtonText(emptyView, "Create business");
            addMenuItem.setVisible(true);
        } else if (!AppData.user.getCan_create_businesses()) {
            emptyView.setVisibility(View.VISIBLE);
            AppHelper.setEmptyViewText(emptyView, "Have more than one company?\nGet in touch!");
            AppHelper.setEmptyButtonText(emptyView, "sales@myjobpitch.com");
            addMenuItem.setVisible(false);
        } else {
            emptyView.setVisibility(View.GONE);
            addMenuItem.setVisible(true);
        }
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        if (adapter.getCount() == 0) {
            BusinessDetailFragment.editBusiness(null);
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
            BusinessDetailFragment.editBusiness(null);
        }
    }

    // business adapter ========================================

    class BusinessesAdapter extends MJPArraySwipeAdapter<Business> {

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
            view.findViewById(R.id.remove_button).setVisibility(AppData.user.getCan_create_businesses() ? View.VISIBLE : View.GONE);
            return view;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            BusinessDetailFragment.showInfo(getItem(position), convertView);

            // edit swipe button
            convertView.findViewById(R.id.edit_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    BusinessDetailFragment.editBusiness(getItem(position));
                }
            });

            // remove swipe button
            convertView.findViewById(R.id.remove_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    BusinessDetailFragment.deleteBusiness(getItem(position), new ResultListener() {
                        @Override
                        public void done(Object result) {
                            loadBusinesses();
                        }
                    });
                }
            });
        }

    }

}
