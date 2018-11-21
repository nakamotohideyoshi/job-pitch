package com.myjobpitch.pages.jobseeker;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.myjobpitch.R;

public class JobseekerProfileActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_jobseeker_profile);

        getSupportActionBar().setTitle("Edit Profile");
    }

}
