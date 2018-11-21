package com.myjobpitch.pages.hr;

import android.os.Bundle;
import android.support.design.widget.TabLayout;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.myjobpitch.R;
import com.myjobpitch.fragments.BaseFragment;
import com.myjobpitch.pages.hr.employees.HREmployeeListFragment;
import com.myjobpitch.pages.hr.jobs.HRJobListFragment;

import butterknife.BindView;
import butterknife.ButterKnife;

public class HRFragment extends BaseFragment {

    @BindView(R.id.tabs)
    TabLayout tabLayout;

    @BindView(R.id.viewpager)
    ViewPager viewPager;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_hr, container, false);
        ButterKnife.bind(this, view);

        title = "HR";

        viewPager.setAdapter(new TabsPagerAdapter(getApp().getSupportFragmentManager()));
        tabLayout.setupWithViewPager(viewPager);

        return view;
    }

    public class TabsPagerAdapter extends FragmentPagerAdapter {

        private String titles[] = new String[] { getString(R.string.hr_tab_jobs), getString(R.string.hr_tab_employees) };

        public TabsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public int getCount() {
            return 2;
        }

        @Override
        public Fragment getItem(int position) {
            return position == 0 ? new HRJobListFragment() : new HREmployeeListFragment();
        }

        @Override
        public CharSequence getPageTitle(int position) {
            return titles[position];
        }
    }
}
