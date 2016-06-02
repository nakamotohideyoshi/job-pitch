package com.myjobpitch.activities;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.text.Html;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;

import com.myjobpitch.R;

public class JobSeekerEditChoiceActivity extends MJPActionBarActivity  {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        setContentView(R.layout.activity_edit_job_seeker_mode_choice);

        Button searchButton = (Button)findViewById(R.id.edit_search_button);
        searchButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.search_settings).toString().toUpperCase(), getText(R.string.search_settings_description))));
        searchButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(JobSeekerEditChoiceActivity.this, EditJobProfileActivity.class));
            }
        });

        Button applicationsButton = (Button)findViewById(R.id.edit_job_seeker_button);
        applicationsButton.setText(Html.fromHtml(String.format("<b>%s</b><br/>%s", getText(R.string.edit_personal_details).toString().toUpperCase(), getText(R.string.edit_personal_details_description))));
        applicationsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startActivity(new Intent(JobSeekerEditChoiceActivity.this, EditJobSeekerActivity.class));
            }
        });
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                intent = NavUtils.getParentActivityIntent(JobSeekerEditChoiceActivity.this);
                startActivity(intent);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }
}
