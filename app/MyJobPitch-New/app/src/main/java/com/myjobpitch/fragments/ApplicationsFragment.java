package com.myjobpitch.fragments;

import android.content.Context;
import android.os.AsyncTask;
import android.support.v4.widget.SwipeRefreshLayout;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ImageButton;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
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

    @BindView(R.id.empty_view)
    View emptyView;

    ApplicationAdapter adapter;
    List<Application> applications = new ArrayList<>();

    int applyButtonIcon;
    int cellLayout;

    protected View initView(LayoutInflater inflater, ViewGroup container, int applyButtonIcon, String emptyText, int cellLayout) {
        this.applyButtonIcon = applyButtonIcon;
        this.cellLayout = cellLayout;

        View view = inflater.inflate(R.layout.fragment_application_list, container, false);
        ButterKnife.bind(this, view);

        // empty view

        AppHelper.setEmptyViewText(emptyView, emptyText);
        AppHelper.setEmptyButtonText(emptyView, "Refresh");

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
            adapter = new ApplicationAdapter(getApp(), applications);
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                selectedApplication(adapter.getItem(position));
            }
        });

        onRefresh();

        return  view;
    }

    protected void loadApplications() {
        new AsyncTask<Void, Void, List<Application>>() {
            @Override
            protected List<Application> doInBackground(Void... params) {
                try {
                    return getApplications();
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return null;
                }
            }
            @Override
            protected void onPostExecute(List<Application> data) {
                swipeRefreshLayout.setRefreshing(false);
                if (data != null) {
                    applications = data;
                    adapter.clear();
                    adapter.addAll(applications);
                    adapter.closeAllItems();
                    emptyView.setVisibility(applications.size()==0 ? View.VISIBLE : View.GONE);
                }
            }
        }.execute();
    }

    @OnClick(R.id.empty_button)
    void onRefresh() {
        swipeRefreshLayout.setRefreshing(true);
        loadApplications();
    }

    // job adapter ========================================

    class ApplicationAdapter extends MJPArraySwipeAdapter<Application> {

        public ApplicationAdapter(Context context, List<Application> jobs) {
            super(context, jobs);
        }

        @Override
        public int getSwipeLayoutResourceId(int position) {
            return R.id.application_list_item;
        }

        @Override
        public View generateView(int position, ViewGroup parent) {
            View view = LayoutInflater.from(getContext()).inflate(cellLayout, parent, false);
            ((ImageButton)view.findViewById(R.id.edit_button)).setImageResource(applyButtonIcon);
            return view;
        }

        @Override
        public void fillValues(final int position, View convertView) {
            showApplicationInfo(getItem(position), convertView);

            // edit swipe button
            convertView.findViewById(R.id.edit_button).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View view) {
                    applyItem(getItem(position));
                }
            });

            // remove swipe button
            convertView.findViewById(R.id.remove_button).setOnClickListener(new View.OnClickListener() {
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

    protected List<Application> getApplications() throws MJPApiException {
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