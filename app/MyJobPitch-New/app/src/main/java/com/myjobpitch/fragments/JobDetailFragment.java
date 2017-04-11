package com.myjobpitch.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

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

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        final View view = inflater.inflate(R.layout.fragment_job_detail, container, false);
        ButterKnife.bind(this, view);

        // menu list

        if (adapter == null) {
            adapter = new MenuAdapter(getApp(), titles);
        }
        listView.setAdapter(adapter);
        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                if (position == 0) {
                    FindTalentFragment fragment = new FindTalentFragment();
                    fragment.job = job;
                    getApp().pushFragment(fragment);
                } else {
                    RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                    fragment.job = job;
                    fragment.listKind = position - 1;
                    getApp().pushFragment(fragment);
                }
            }
        });

        // header view, loading data

        title = "Job Detail";
        navTitleView.setVisibility(View.GONE);
        navRightButton.setVisibility(View.GONE);

        view.setVisibility(View.INVISIBLE);
        new APITask("Loading...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                job = MJPApi.shared().getUserJob(job.getId());
            }
            @Override
            protected void onSuccess() {
                view.setVisibility(View.VISIBLE);
                AppHelper.showJobInfo(job, infoView);
            }
        };

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
        Popup.showYellow("Are you sure you want to delete " + job.getTitle(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                new APITask("Deleting...", JobDetailFragment.this) {
                    @Override
                    protected void runAPI() throws MJPApiException {
                        MJPApi.shared().deleteJob(job.getId());
                    }
                    @Override
                    protected void onSuccess() {
                        getApp().popFragment();
                    }
                };
            }
        }, "Cancel", null, true);
    }

    // menu adapter ========================================

    private int[] images = {
            R.drawable.menu_user_search, R.drawable.menu_application, R.drawable.menu_connect, R.drawable.menu_shortlisted, R.drawable.menu_message
    };

    private String[] titles = {
            "Find Talent", "Applications", "Connections", "My Shortlist", "Messages"
    };

    private class MenuAdapter extends ArrayAdapter<String> {

        public MenuAdapter(Context context, String[] titles) {
            super(context, 0, titles);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            if(convertView == null){
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_job_menu, parent, false);
            }

            ImageView imageView = (ImageView) convertView.findViewById(R.id.cell_image);
            imageView.setImageResource(images[position]);

            TextView textView = (TextView) convertView.findViewById(R.id.cell_text);
            textView.setText(titles[position]);

            return convertView;
        }
    }

}
