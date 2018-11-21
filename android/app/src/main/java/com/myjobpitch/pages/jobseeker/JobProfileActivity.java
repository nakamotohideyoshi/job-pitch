package com.myjobpitch.pages.jobseeker;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.myjobpitch.R;

public class JobProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_jobprofile);

        getSupportActionBar().setTitle("Job Profile");
    }

}
