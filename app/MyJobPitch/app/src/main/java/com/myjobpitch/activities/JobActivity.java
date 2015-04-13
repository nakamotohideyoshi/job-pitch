package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Experience;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.CreateUpdateApplicationTask;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;

import java.util.ArrayList;
import java.util.List;

public class JobActivity extends MJPProgressActionBarActivity {

    private BackgroundTaskManager backgroundTaskManager;
    private class BackgroundTaskManager {
        private List<APITask<?>> tasks = new ArrayList<>();
        private List<Runnable> taskCompletionActions = new ArrayList<>();

        public synchronized void addTaskCompletionAction(Runnable runnable) {
            taskCompletionActions.add(runnable);
        }

        public synchronized void addBackgroundTask(final APITask<?> task) {
            tasks.add(task);
            task.addListener(new APITaskListener() {
                @Override
                public void onPostExecute() {
                    removeTask(task);
                }

                @Override
                public void onCancelled() {
                    removeTask(task);
                }
            });
            // Update tasks now, in case the task finished while we were
            // faffing around up above
            for (APITask<?> t : new ArrayList<>(tasks))
                if (task.isExecuted())
                    tasks.remove(task);
            checkTasksComplete();
        }

        private synchronized void removeTask(APITask<?> task) {
            tasks.remove(task);
            checkTasksComplete();
        }

        private void checkTasksComplete() {
            if (tasks.isEmpty())
                for (Runnable action : taskCompletionActions)
                    action.run();
        }
    }

    private View mProgressView;
    private View mJobSeekerSearchView;
    private Switch mAppliedSwitch;
    private Switch mShortListedSwitch;
    private boolean mButtonActivation = false;
    private View mBackgroundProgress;

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
        backgroundTaskManager = new BackgroundTaskManager();
        backgroundTaskManager.addTaskCompletionAction(new Runnable() {
            @Override
            public void run() {
                mBackgroundProgress.setVisibility(View.GONE);
            }
        });
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_job);
        job_id = getIntent().getIntExtra("job_id", -1);

        mJobSeekerSearchView = findViewById(R.id.job_seeker_search);
        mProgressView = findViewById(R.id.progress);
        mBackgroundProgress = findViewById(R.id.background_progress);

        mAppliedSwitch = (Switch) findViewById(R.id.applied_switch);
        mAppliedSwitch.setChecked(true);
        mAppliedSwitch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mShortListedSwitch.setEnabled(mAppliedSwitch.isChecked());
                loadJobSeekers();
            }
        });
        mShortListedSwitch = (Switch) findViewById(R.id.shortlisted_switch);
        mShortListedSwitch.setEnabled(false);
        mShortListedSwitch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadJobSeekers();
            }
        });

        final Button mPositiveButton = (Button) findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!jobSeekers.isEmpty()) {
                    if (mAppliedSwitch.isChecked()) {
                        // TODO open messages
                    } else {
                        mButtonActivation = true;
                        mCards.getTopCardListener().selectLeft();
                    }
                }
            }
        });
        final Button mNegativeButton = (Button) findViewById(R.id.negative_button);
        mNegativeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!jobSeekers.isEmpty()) {
                    JobSeeker jobSeeker = jobSeekers.get(0);
                    String name = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
                    String message = "Are you sure you want to remove " + name + "? This job seeker will never appear again for this job.";

                    AlertDialog.Builder builder = new AlertDialog.Builder(JobActivity.this);
                    builder.setMessage(message)
                            .setCancelable(false)
                            .setPositiveButton(getString(R.string.remove), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                    mButtonActivation = true;
                                    mCards.getTopCardListener().selectRight();
                                }
                            })
                            .setNegativeButton(getString(R.string.cancel), new DialogInterface.OnClickListener() {
                                public void onClick(DialogInterface dialog, int id) {
                                    dialog.cancel();
                                }
                            }).create().show();
                }
            }
        });
        final Button mShortlistButton = (Button) findViewById(R.id.shortlist_button);

        mCards = (SwipeFlingAdapterView) findViewById(R.id.job_seeker_cards);
        mCards.setFlingListener(new SwipeFlingAdapterView.onFlingListener() {
            @Override
            public void removeFirstObjectInAdapter() {
            }

            @Override
            public void onLeftCardExit(Object dataObject) {
                JobSeeker jobSeeker = jobSeekers.remove(0);
                if (mAppliedSwitch.isChecked()) {
                    // Add to end of list so list loops around
                    jobSeekers.add(jobSeeker);
                } else {
                    // Create application for job seeker
                    Application application = new Application();
                    application.setJob(job_id);
                    application.setJob_seeker(jobSeeker.getId());
                    application.setCreated_by(getMJPApplication().get(Role.class, "RECRUITER").getId());
                    application.setStatus(getMJPApplication().get(ApplicationStatus.class, "CREATED").getId());
                    application.setShortlisted(false);
                    CreateUpdateApplicationTask task = new CreateUpdateApplicationTask(getApi(), application);
                    backgroundTaskManager.addBackgroundTask(task);
                    mBackgroundProgress.setVisibility(View.VISIBLE);
                    task.execute();
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onRightCardExit(Object dataObject) {
                JobSeeker jobSeeker = jobSeekers.remove(0);
                if (mAppliedSwitch.isChecked()) {
                    if (!mButtonActivation) {
                        // Add to end of list so list loops around
                        jobSeekers.add(jobSeeker);
                    }
                } else {
                    if (mButtonActivation) {
                        // Mark job seeker as ineligible for searches
                        // TODO update application status
                        Log.d("JobActivity", "TODO update application status");
                    }
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
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
                if (mAppliedSwitch.isChecked()) {
                    mPositiveButton.setText(getString(R.string.messages));
                    mShortlistButton.setVisibility(View.VISIBLE);
                } else {
                    mPositiveButton.setText(getString(R.string.connect));
                    mShortlistButton.setVisibility(View.GONE);
                }
                mNegativeButton.setText(getString(R.string.remove));
                mShortlistButton.setEnabled(notEmpty);
                mPositiveButton.setEnabled(notEmpty);
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
        ReadJobSeekersTask readJobSeekers = new ReadJobSeekersTask(getApi(), job_id, mAppliedSwitch.isChecked(), mShortListedSwitch.isChecked());
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
