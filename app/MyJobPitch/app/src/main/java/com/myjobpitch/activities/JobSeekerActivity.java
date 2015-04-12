package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import com.myjobpitch.R;

public class JobSeekerActivity extends MJPActionBarActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job_seeker);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.job_seeker, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case R.id.action_edit_profile:
                intent = new Intent(this, EditJobSeekerActivity.class);
                intent.putExtra("job_seeker_id", getApi().getUser().getJob_seeker());
                startActivity(intent);
                return true;
            case R.id.action_edit_job_profile:
                intent = new Intent(this, EditJobProfileActivity.class);
                intent.putExtra("job_profile_id", getApi().getUser().getJob_seeker());
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
