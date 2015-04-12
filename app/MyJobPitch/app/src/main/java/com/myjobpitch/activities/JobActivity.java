package com.myjobpitch.activities;

import android.content.Context;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Experience;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;

import java.util.ArrayList;
import java.util.List;

public class JobActivity extends MJPProgressActionBarActivity {

    private View mProgressView;
    private View mJobSeekerSearchView;
    private Switch mAppliedSwitch;
    private Switch mShortListedSwitch;

    class JobSeekerAdapter extends ArrayAdapter<JobSeeker> {
        public JobSeekerAdapter(List<JobSeeker> list) {
            super(JobActivity.this, R.layout.list_item, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            JobSeeker jobSeeker = this.getItem(position);

            LayoutInflater inflater = (LayoutInflater) JobActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View cardView = inflater.inflate(R.layout.card_job_seeker, parent, false);

//            ImageView imageView = (ImageView) rowView.findViewById(R.id.icon);
            TextView nameView = (TextView) cardView.findViewById(R.id.job_seeker_name);
            nameView.setText(jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name());
            TextView extraView = (TextView) cardView.findViewById(R.id.job_seeker_extra);
            String extraText = "";
            Integer age = jobSeeker.getAge();
            if (jobSeeker.getAge_public() && age != null)
                extraText += age;
            Integer sexID = jobSeeker.getSex();
            if (jobSeeker.getSex_public() && sexID != null) {
                if (!extraText.isEmpty())
                    extraText += " ";
                extraText += getMJPApplication().get(Sex.class, sexID).getShort_name();
            }
            extraView.setText(extraText);
            TextView descriptionView = (TextView) cardView.findViewById(R.id.job_seeker_description);
            String description = "";
            for (Experience experience : jobSeeker.getExperience()) {
                if (!description.isEmpty())
                    description += "\n";
                description += experience.getDetails();
            }
            descriptionView.setText(description);
            return cardView;
        }
    }

    private Integer job_id;
    private SwipeFlingAdapterView mCards;
    private List<JobSeeker> jobSeekers;
    private ArrayAdapter<JobSeeker> adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job);
        job_id = getIntent().getIntExtra("job_id", -1);

        mJobSeekerSearchView = findViewById(R.id.job_seeker_search);
        mProgressView = findViewById(R.id.progress);

        mAppliedSwitch = (Switch) findViewById(R.id.applied_switch);
        mAppliedSwitch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadJobSeekers();
            }
        });
        mShortListedSwitch = (Switch) findViewById(R.id.shortlisted_switch);
        mShortListedSwitch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadJobSeekers();
            }
        });

        final View mPositiveButton = findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!jobSeekers.isEmpty())
                    mCards.getTopCardListener().selectLeft();
            }
        });
        final View mNegativeButton = findViewById(R.id.negative_button);
        mNegativeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!jobSeekers.isEmpty())
                    mCards.getTopCardListener().selectRight();
            }
        });
        final View mShortlistButton = findViewById(R.id.shortlist_button);

        mCards = (SwipeFlingAdapterView) findViewById(R.id.job_seeker_cards);
        mCards.setFlingListener(new SwipeFlingAdapterView.onFlingListener() {
            @Override
            public void removeFirstObjectInAdapter() {
                // this is the simplest way to delete an object from the Adapter (/AdapterView)
                Log.d("swipe", "removed object!");
                jobSeekers.remove(0);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onLeftCardExit(Object dataObject) {
                Toast.makeText(JobActivity.this, "Left!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onRightCardExit(Object dataObject) {
                Toast.makeText(JobActivity.this, "Right!", Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onAdapterAboutToEmpty(int itemsInAdapter) {
                // Ask for more data here
                Log.d("swipe", "onAdapterAboutToEmpty(" + itemsInAdapter + ")");
//                al.add("XML ".concat(String.valueOf(i)));
//                arrayAdapter.notifyDataSetChanged();
//                Log.d("LIST", "notified");
            }

            @Override
            public void onScroll(float v) {
                Log.d("swipe", "onScroll(" + v + ")");
            }
        });

        mCards.setOnItemClickListener(new SwipeFlingAdapterView.OnItemClickListener() {
            @Override
            public void onItemClicked(int itemPosition, Object dataObject) {
                Toast.makeText(JobActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
            }
        });

        jobSeekers = new ArrayList();
        adapter = new JobSeekerAdapter(jobSeekers);
        mCards.setAdapter(adapter);
        adapter.registerDataSetObserver(new DataSetObserver() {
            private void update() {
                boolean notEmpty = adapter.getCount() > 0;
                mPositiveButton.setEnabled(notEmpty);
                mShortlistButton.setEnabled(notEmpty);
                mNegativeButton.setEnabled(notEmpty);
            }

            @Override
            public void onChanged() {
                update();
            }

            @Override
            public void onInvalidated() {
                update();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobSeekers();
    }

    private void loadJobSeekers() {
        showProgress(true);
        ReadJobSeekersTask readJobSeekers = new ReadJobSeekersTask(getApi(), job_id);
        readJobSeekers.addListener(new CreateReadUpdateAPITaskListener<List<JobSeeker>>() {
            @Override
            public void onSuccess(List<JobSeeker> result) {
                jobSeekers.clear();
                jobSeekers.addAll(result);
                adapter.notifyDataSetChanged();
                mCards.setAdapter(adapter);
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobActivity.this, "Error loading job seekers", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        readJobSeekers.execute();
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mJobSeekerSearchView;
    }
}
