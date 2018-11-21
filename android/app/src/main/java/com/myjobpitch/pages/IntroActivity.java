package com.myjobpitch.pages;

import android.app.AlertDialog;
import android.content.Intent;
import android.support.v7.app.AppCompatActivity;

import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;
import android.support.v4.view.ViewPager;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.pages.jobseeker.JobseekerProfileActivity;
import com.myjobpitch.pages.recruiter.BusinessEditActivity;
import com.myjobpitch.utils.AppData;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class IntroActivity extends AppCompatActivity {

    @BindView(R.id.viewpaper)
    ViewPager mViewPager;

    @BindView(R.id.next_button)
    Button mNextButton;

    @BindView(R.id.skip_button)
    Button mSkipButton;

    SectionsPagerAdapter mSectionsPagerAdapter;

    int mCurrentPage = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_intro);
        ButterKnife.bind(this);

        mSectionsPagerAdapter = new SectionsPagerAdapter(getSupportFragmentManager());
        mViewPager.setAdapter(mSectionsPagerAdapter);
        mViewPager.addOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {
            }

            @Override
            public void onPageSelected(int position) {
                if (mCurrentPage != position) {
                    findViewById(DOT_IDS[mCurrentPage]).setBackgroundResource(R.drawable.circle_dark);
                    mCurrentPage = position;
                    findViewById(DOT_IDS[mCurrentPage]).setBackgroundResource(R.drawable.circle_yellow);
                    mNextButton.setText(mCurrentPage == 3 ? R.string.ready_button : R.string.next_button);
                    mSkipButton.setVisibility(mCurrentPage == 3 ? View.INVISIBLE : View.VISIBLE);
                }
            }

            @Override
            public void onPageScrollStateChanged(int state) {
            }
        });
    }


    @OnClick(R.id.next_button)
    void onNext() {
        if (mCurrentPage < 3) {
            mViewPager.setCurrentItem(mCurrentPage + 1, true);
        } else {
            onSkip();
        }
    }

    @OnClick(R.id.skip_button)
    void onSkip() {
        Intent intent;
        if (AppData.userRole == Role.RECRUITER_ID) {
            intent = new Intent(this, BusinessEditActivity.class);
        } else {
            intent = new Intent(this, JobseekerProfileActivity.class);
        }
        startActivity(intent);
        overridePendingTransition(R.anim.slide_in_right, R.anim.slide_out_left);
        finish();
    }

    @Override
    public void onBackPressed() {
        new AlertDialog.Builder(this)
                .setMessage(R.string.logout_message)
                .setPositiveButton(R.string.logout_button, (dialog, id) -> {
                    Intent intent = new Intent(this, LoginActivity.class);
                    startActivity(intent);
                    overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                    finish();
                })
                .setNegativeButton(R.string.cancel, null)
                .create()
                .show();
    }

    class SectionsPagerAdapter extends FragmentPagerAdapter {

        public SectionsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            fragment.page = position;
            return fragment;
        }

        @Override
        public int getCount() {
            return DOT_IDS.length;
        }
    }

    public static class PlaceholderFragment extends Fragment {

        @BindView(R.id.intro_title)
        TextView mTitleView;

        @BindView(R.id.intro_image)
        ImageView mImageView;

        @BindView(R.id.intro_comment)
        TextView mCommentView;

        public int page;

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.fragment_intro, container, false);
            ButterKnife.bind(this, rootView);

            int[] info = (AppData.userRole == Role.RECRUITER_ID ? RC_DATA : JS_DATA)[page];

            mImageView.setImageResource(info[0]);
            mTitleView.setText(info[1]);
            mCommentView.setText(info[2]);
            return rootView;
        }
    }

    static final int[] DOT_IDS = {R.id.dot0, R.id.dot1, R.id.dot2, R.id.dot3};

    static final int[][] RC_DATA = {
            {R.drawable.logo1, R.string.rc_intro_title1, R.string.rc_intro_comment1},
            {R.drawable.intro1, R.string.rc_intro_title2, R.string.rc_intro_comment2},
            {R.drawable.intro2, R.string.rc_intro_title3, R.string.rc_intro_comment3},
            {R.drawable.intro3, R.string.rc_intro_title4, R.string.rc_intro_comment4}
    };

    static final int[][] JS_DATA = {
            {R.drawable.logo1, R.string.js_intro_title1, R.string.js_intro_comment1},
            {R.drawable.intro1, R.string.js_intro_title2, R.string.js_intro_comment2},
            {R.drawable.intro2, R.string.js_intro_title3, R.string.js_intro_comment3},
            {R.drawable.intro3, R.string.js_intro_title4, R.string.js_intro_comment4}
    };
}
