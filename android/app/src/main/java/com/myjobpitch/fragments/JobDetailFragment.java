package com.myjobpitch.fragments;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class JobDetailFragment extends BaseFragment {

    @BindView(R.id.job_info)
    View infoView;

    @BindView(R.id.nav_title)
    TextView navTitleView;
    @BindView(R.id.nav_right_button)
    ImageButton navRightButton;

    @BindView(R.id.job_menu_list)
    ListView listView;

    MenuAdapter adapter;

    public Job job;
    public List <Application>  data;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_detail, container, false);
        ButterKnife.bind(this, view);

        addMenuItem(MENUGROUP2, 100, getString(R.string.share), R.drawable.ic_share);

        // menu list

        if (adapter == null) {
            adapter = new MenuAdapter(getApp(), titles);
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener((parent, view1, position, id) -> {
            if (position == 0) {
                FindTalentFragment fragment = new FindTalentFragment();
                fragment.job = job;
                getApp().pushFragment(fragment);
            } else if (position == 4) {
                if (job.getStatus() == 2) {
                    Popup popup = new Popup(getContext(), R.string.to_message_activate_job, true);
                    popup.addGreenButton(R.string.activate, view11 -> {
                        JobEditFragment fragment = new JobEditFragment();
                        fragment.job = job;
                        fragment.activation = true;
                        getApp().pushFragment(fragment);
                    });
                    popup.addGreyButton(R.string.cancel, v -> {
                    });
                    popup.show();
                } else {
                    MessageListFragment fragment = new MessageListFragment();
                    fragment.job = job;
                    getApp().pushFragment(fragment);
                }

            } else if (position == 5) {
                InterviewsFragment fragment = new InterviewsFragment();
                fragment.job = job;
                getApp().pushFragment(fragment);
            } else {
                RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                fragment.job = job;
                fragment.listKind = position - 1;
                getApp().pushFragment(fragment);
            }
        });

        // header view, loading data

        title = getString(R.string.job_details);
        navTitleView.setVisibility(View.GONE);
        navRightButton.setVisibility(View.GONE);

        showLoading(view);
        new APITask(() -> job = MJPApi.shared().getUserJob(job.getId())).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                AppHelper.showJobInfo(job, infoView);
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

        new APITask(() -> {
            String query = "job=" + job.getId();
            data = MJPApi.shared().get(Application.class, query);

        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                int cnt_applications = 0, cnt_connections = 0, cnt_shortlists = 0;

                for(int i=0; i<data.size(); i++) {

                    if (data.get(i).getStatus() == 1)
                        cnt_applications++;

                    else if (data.get(i).getStatus() == 2) {
                        cnt_connections++;

                        if (data.get(i).getShortlisted())
                            cnt_shortlists++;
                    }
                }

                counts[1] = " (" + cnt_applications + ")";
                counts[2] = " (" + cnt_connections + ")";
                counts[3] = " (" + cnt_shortlists + ")";

                adapter.notifyDataSetChanged();

                hideLoading();

            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();



        return view;
    }

    @OnClick(R.id.edit_button)
    void onEditJob() {
        JobEditFragment fragment = new JobEditFragment();
        fragment.job = job;
        getApp().pushFragment(fragment);
    }

    @OnClick(R.id.remove_button)
    void onRemoveJob() {
        Popup popup = new Popup(getContext(), String.format(getString(R.string.remove_message), job.getTitle()), true);
        popup.addYellowButton(R.string.delete, view -> {
            showLoading();
            new APITask(() -> MJPApi.shared().deleteJob(job.getId())).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    getApp().popFragment();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        });
        popup.addGreyButton(R.string.cancel, null);
        popup.show();
    }

    @Override
    public void onMenuSelected(int menuID) {
        if (menuID == 100) {
            String link = String.format("%sjobseeker/jobs/%d", MJPApi.apiUrl, job.getId());
            Intent sharingIntent = new Intent(Intent.ACTION_SEND);
            sharingIntent.setType("text/html");
            sharingIntent.putExtra(android.content.Intent.EXTRA_TEXT, link);
            startActivity(Intent.createChooser(sharingIntent,getString(R.string.share_using)));
        }
    }

    // menu adapter ========================================

    private int[] images = {
            R.drawable.menu_search, R.drawable.menu_new_applications, R.drawable.menu_applications1, R.drawable.menu_shortlist, R.drawable.menu_message, R.drawable.menu_interview
    };

    private Integer[] titles = {
            R.string.find_talent, R.string.applications_title, R.string.connections_title, R.string.my_shortlist, R.string.messages_title, R.string.interviews_title
    };
    public String[] counts = {
            "", "", "", "", "", ""
    };

    private class MenuAdapter extends ArrayAdapter<Integer> {

        public MenuAdapter(Context context, Integer[] titles) {
            super(context, 0, titles);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if(convertView == null){
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_job_menu, parent, false);
            }

            ImageView imageView = convertView.findViewById(R.id.cell_image);
            imageView.setImageResource(images[position]);

            TextView textView = convertView.findViewById(R.id.cell_text);
            textView.setText(titles[position] + counts[position]);

            return convertView;
        }
    }

}
