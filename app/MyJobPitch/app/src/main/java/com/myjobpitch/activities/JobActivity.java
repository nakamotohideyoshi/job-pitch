package com.myjobpitch.activities;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.R;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;

import java.util.ArrayList;
import java.util.List;

public class JobActivity extends MJPProgressActionBarActivity {

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
//            TextView subtitleView = (TextView) rowView.findViewById(R.id.subtiltle);
//            titleView.setText(job.getTitle());
//            subtitleView.setText(job.getDescription());
            return cardView;
        }
    }

    private Integer job_id;
    private SwipeFlingAdapterView mCards;
    private List<JobSeeker> job_seekers;
    private ArrayAdapter<JobSeeker> adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job);

        job_id = getIntent().getIntExtra("job_id", -1);

        loadJobSeekers();

        //add the view via xml or programmatically
        mCards = (SwipeFlingAdapterView) findViewById(R.id.job_seeker_cards);
        mCards.setFlingListener(new SwipeFlingAdapterView.onFlingListener() {
            @Override
            public void removeFirstObjectInAdapter() {
                // this is the simplest way to delete an object from the Adapter (/AdapterView)
                Log.d("swipe", "removed object!");
                job_seekers.remove(0);
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

        // Optionally add an OnItemClickListener
        mCards.setOnItemClickListener(new SwipeFlingAdapterView.OnItemClickListener() {
            @Override
            public void onItemClicked(int itemPosition, Object dataObject) {
                Toast.makeText(JobActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void loadJobSeekers() {
        showProgress(true);
        ReadJobSeekersTask readJobSeekers = new ReadJobSeekersTask(getApi(), job_id);
        readJobSeekers.addListener(new CreateReadUpdateAPITaskListener<List<JobSeeker>>() {
            @Override
            public void onSuccess(List<JobSeeker> result) {
                job_seekers = new ArrayList(result);
                adapter = new JobSeekerAdapter(job_seekers);
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
        return findViewById(R.id.progress);
    }

    @Override
    public View getMainView() {
        return findViewById(R.id.job_seeker_cards);
    }
}
