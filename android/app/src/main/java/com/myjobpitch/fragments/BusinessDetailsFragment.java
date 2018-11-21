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
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Workplace;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.MJPArraySwipeAdapter;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class BusinessDetailsFragment extends BaseFragment {

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
    private WorkplacesAdapter adapter;
    private boolean isAddMode = false;

    public boolean isFirstCreate = false;
    public Integer businessId;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_business_details, container, false);
        ButterKnife.bind(this, view);

        isAddMode = getApp().getCurrentMenuID() != R.id.menu_business;

        // header view

        if (isAddMode) {
            title = "Add job";
            AppHelper.getImageView(infoView).setColorFilter(ContextCompat.getColor(getApp(), R.color.greenColor));
            AppHelper.getImageView(infoView).setImageResource(R.drawable.menu_business);
            editButtonsView.setVisibility(View.GONE);
            navTitleView.setText("Select work place");
        } else {
            title = "Business Details";
            headerCommentView.setVisibility(View.GONE);
            navTitleView.setText("Work Places");
        }

        // empty view

        AppHelper.setEmptyViewText(emptyView, "You have not added any\nworkplaces yet.");
        AppHelper.setEmptyButtonText(emptyView, "Create workplace");

        // pull to refresh

        swipeRefreshLayout.setColorSchemeResources(R.color.greenColor, R.color.yellowColor);
        swipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                if (loading == null) {
                    loadWorkplaces();
                }
            }
        });

        // list view

        if (adapter == null) {
            adapter = new WorkplacesAdapter(getApp(), new ArrayList<Workplace>());
        } else {
            adapter.clear();
        }

        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Workplace location = adapter.getItem(position);
                if (isAddMode) {
                    JobEditFragment fragment = new JobEditFragment();
                    fragment.workplace = location;
                    getApp().pushFragment(fragment);
                } else {
                    WorkplaceDetailsFragment fragment = new WorkplaceDetailsFragment();
                    fragment.location = location;
                    getApp().pushFragment(fragment);
                }
            }
        });

        showLoading(view);
        new APITask(new APIAction() {
            @Override
            public void run() {
                business = MJPApi.shared().getUserBusiness(businessId);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                if (!isAddMode) {
                    AppHelper.showBusinessInfo(business, infoView);
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
        final List<Workplace> locations = new ArrayList<>();
        new APITask(new APIAction() {
            @Override
            public void run() {
                locations.addAll(MJPApi.shared().getUserWorkplaces(businessId));
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                adapter.clear();
                adapter.addAll(locations);
                updatedWorkplaceList();
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
        new Popup(getContext())
                .setMessage("Are you sure you want to delete " + business.getName())
                .addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        int locationCount = business.getLocations().size();
                        if (locationCount == 0) {
                            deleteBusinessAction();
                            return;
                        }

                        new Popup(getContext())
                                .setMessage("Deleting this business will also delete " + locationCount + " workplaces and all their jobs. If you want to hide the jobs instead you can deactive them.")
                                .addYellowButton("Delete", new View.OnClickListener() {
                                    @Override
                                    public void onClick(View view) {
                                        deleteBusinessAction();
                                    }
                                })
                                .addGreyButton("Cancel", null)
                                .show();
                    }
                })
                .addGreyButton("Cancel", null)
                .show();
    }

    void deleteBusinessAction() {
        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run() {
                MJPApi.shared().deleteBusiness(business.getId());
            }
        }).addListener(new APITaskListener() {
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

    private void updatedWorkplaceList() {
        adapter.closeAllItems();

        int locationCount = adapter.getCount();
        if (!isAddMode) {
            AppHelper.getItemSubTitleView(infoView).setText("Includes " + locationCount + (locationCount > 1 ? " work places" : " work place"));
        }
        firstCreateMessage.setVisibility(isFirstCreate ? View.VISIBLE : View.GONE);
        emptyView.setVisibility(isFirstCreate || locationCount>0 ? View.GONE : View.VISIBLE);
    }

    private void deleteWorkplace(final Workplace location) {
        new Popup(getContext())
                .setMessage("Are you sure you want to delete " + location.getName())
                .addYellowButton("Delete", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        int jobCount = location.getJobs().size();
                        if (jobCount == 0) {
                            deleteWorkplaceAction(location);
                            return;
                        }

                        new Popup(getContext())
                                .setMessage("Deleting this workplace will also delete " + jobCount + " jobs. If you want to hide the jobs instead you can deactive them.")
                                .addYellowButton("Delete", new View.OnClickListener() {
                                    @Override
                                    public void onClick(View view) {
                                        deleteWorkplaceAction(location);
                                    }
                                })
                                .addGreyButton("Cancel", null)
                                .show();
                    }
                })
                .addGreyButton("Cancel", null)
                .show();
    }

    private void deleteWorkplaceAction(final Workplace location) {
        showLoading(listContainer);
        new APITask(new APIAction() {
            @Override
            public void run() {
                MJPApi.shared().deleteWorkplace(location.getId());
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                adapter.remove(location);
                updatedWorkplaceList();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }


    @OnClick(R.id.nav_right_button)
    void onAddWorkplace() {
        isFirstCreate = false;
        WorkplaceEditFragment fragment = new WorkplaceEditFragment();
        fragment.business = business;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.empty_button)
    void onClickEmptyButton() {
        onAddWorkplace();
    }

    @OnClick(R.id.first_create_text)
    void onClickFirstCreateView() {
        onAddWorkplace();
    }

    // workplace adapter ========================================

    private class WorkplacesAdapter extends MJPArraySwipeAdapter<Workplace> {

        public WorkplacesAdapter(Context context, List<Workplace> locations) {
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
            AppHelper.showWorkplaceInfo(adapter.getItem(position), convertView);

            if (isAddMode) {
                AppHelper.getEditButton(convertView).setVisibility(View.GONE);
                AppHelper.getRemoveButton(convertView).setVisibility(View.GONE);
            } else {
                AppHelper.getEditButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        closeItem(position);
                        WorkplaceEditFragment fragment = new WorkplaceEditFragment();
                        fragment.location = getItem(position);
                        getApp().pushFragment(fragment);
                    }
                });
                AppHelper.getRemoveButton(convertView).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        deleteWorkplace(getItem(position));
                    }
                });
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
