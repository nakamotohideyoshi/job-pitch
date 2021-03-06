package com.myjobpitch.activities;

import android.app.Activity;
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

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class IntroActivity extends AppCompatActivity {

    SectionsPagerAdapter mSectionsPagerAdapter;

    @BindView(R.id.container)
    ViewPager mViewPager;

    @BindView(R.id.im_ready)
    Button mReadyButton;

    @BindView(R.id.skip)
    Button mSkipButton;

    int mCurrentPage = 0;
    static final int[] DOT_IDS = {R.id.dot0, R.id.dot1, R.id.dot2, R.id.dot3};

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
                if (mCurrentPage != -1) {
                    findViewById(DOT_IDS[mCurrentPage]).setBackgroundResource(R.drawable.circle_dark);
                }
                if (mCurrentPage != position) {
                    mReadyButton.setText(position == 3 ? R.string.im_read : R.string.next);
                    mSkipButton.setVisibility(position == 3 ? View.INVISIBLE : View.VISIBLE);
                }
                mCurrentPage = position;
                findViewById(DOT_IDS[mCurrentPage]).setBackgroundResource(R.drawable.circle_yellow);
            }

            @Override
            public void onPageScrollStateChanged(int state) {
            }
        });

        findViewById(DOT_IDS[mCurrentPage]).setBackgroundResource(R.drawable.circle_yellow);

    }


    @OnClick(R.id.im_ready)
    void onImReady() {
        if (mCurrentPage < 3) {
            mViewPager.setCurrentItem(mCurrentPage+1, true);
            return;
        }

        onSkip();
    }

    @OnClick(R.id.skip)
    void onSkip() {
        Intent intent = new Intent();
        setResult(Activity.RESULT_OK, intent);
        finish();
    }

    class SectionsPagerAdapter extends FragmentPagerAdapter {

        public SectionsPagerAdapter(FragmentManager fm) {
            super(fm);
        }

        @Override
        public Fragment getItem(int position) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            fragment.mSection = position;
            return fragment;
        }

        @Override
        public int getCount() {
            return 4;
        }

    }

    public static class PlaceholderFragment extends Fragment {

        static final int[] TITLE_DATA = {
                R.string.js_intro_title0,
                R.string.js_intro_title1,
                R.string.js_intro_title2,
                R.string.js_intro_title3
        };

        static final int[] IMAGE_DATA = {
                R.drawable.logo1, R.drawable.intro1, R.drawable.intro2, R.drawable.intro3
        };

        static final int[] COMMENT_DATA = {
                R.string.js_intro_comment0,
                R.string.js_intro_comment1,
                R.string.js_intro_comment2,
                R.string.js_intro_comment3
        };

        @BindView(R.id.onboarding_title)
        TextView mTitleView;

        @BindView(R.id.onboarding_image)
        ImageView mImageView;

        @BindView(R.id.onboarding_comment)
        TextView mCommentView;

        public int mSection;

        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {
            View rootView = inflater.inflate(R.layout.fragment_intro, container, false);
            ButterKnife.bind(this, rootView);

            mTitleView.setText(TITLE_DATA[mSection]);
            mImageView.setImageResource(IMAGE_DATA[mSection]);
            mCommentView.setText(COMMENT_DATA[mSection]);
            return rootView;
        }

    }

}
