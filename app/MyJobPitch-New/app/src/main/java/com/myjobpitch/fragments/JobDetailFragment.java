package com.myjobpitch.fragments;

import android.content.Context;
import android.os.AsyncTask;
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

import com.myjobpitch.MainActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.ImageLoader;
import com.myjobpitch.utils.Popup;
import com.myjobpitch.utils.ResultListener;

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

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_job_detail, container, false);
        ButterKnife.bind(this, view);

        title = "Job Detail";
        navTitleView.setVisibility(View.GONE);
        navRightButton.setVisibility(View.GONE);

        showInfo(LocationDetailFragment.selectedJob, infoView);

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
                    fragment.job = LocationDetailFragment.selectedJob;
                    getApp().pushFragment(fragment);
                } else {
                    RecruiterApplicationsFragment fragment = new RecruiterApplicationsFragment();
                    fragment.job = LocationDetailFragment.selectedJob;
                    fragment.listKind = position - 1;
                    getApp().pushFragment(fragment);
                }
            }
        });

        // remove menu

        return view;
    }

    @OnClick(R.id.edit_button)
    void onEditJob() {
        editJob(LocationDetailFragment.selectedJob);
    }

    @OnClick(R.id.remove_button)
    void onRemoveJob() {
        deleteJob(LocationDetailFragment.selectedJob, new ResultListener() {
            @Override
            public void done(Object result) {
                getApp().popFragment();
            }
        });
    }

    // menu adapter ========================================

    int[] images = {
            R.drawable.menu_user_search, R.drawable.menu_application, R.drawable.menu_connect, R.drawable.menu_shortlisted, R.drawable.menu_message
    };

    String[] titles = {
            "Find Talent", "Applications", "Connections", "My Shortlist", "Messages"
    };

    class MenuAdapter extends ArrayAdapter<String> {

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

    // job info ========================================

    public static void showInfo(Job job, View view) {

        // logo

        ImageLoader.loadJobLogo(job, view);

        // job title

        TextView titleView = (TextView)view.findViewById(R.id.item_title);
        titleView.setText(job.getTitle());

        // business and location name

        TextView subtitleView = (TextView)view.findViewById(R.id.item_subtitle);
        subtitleView.setText(job.getFullBusinessName());
        view.findViewById(R.id.item_attributes).setVisibility(View.GONE);

    }

    // job edit ========================================

    public static void editJob(Job job) {
        LocationDetailFragment.selectedJob = job;
        JobEditFragment fragment = new JobEditFragment();
        MainActivity.instance.pushFragment(fragment);
    }

    public static void deleteJob(final Job job, final ResultListener listener) {

        Popup.showYellow("Are you sure you want to delete " + job.getTitle(), "Delete", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AppHelper.showLoading("Deleting...");
                new AsyncTask<Void, Void, Boolean>() {
                    @Override
                    protected Boolean doInBackground(Void... params) {
                        try {
                            MJPApi.shared().deleteJob(job.getId());
                            BusinessDetailFragment.selectedLocation = MJPApi.shared().get(Location.class, BusinessDetailFragment.selectedLocation.getId());
                            return true;
                        } catch (MJPApiException e) {
                            Popup.showGreen(e.getMessage(), null, null, "OK", null, true);
                            return false;
                        }
                    }
                    @Override
                    protected void onPostExecute(Boolean success) {
                        if (success) {
                            AppHelper.hideLoading();
                            BusinessDetailFragment.requestReloadLocations = true;
                            LocationDetailFragment.requestReloadJobs = true;
                            if (listener != null) {
                                listener.done(null);
                            }
                        }
                    }
                }.execute();
            }
        }, "Cancel", null, true);

    }

}
