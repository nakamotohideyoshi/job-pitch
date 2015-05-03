package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.database.DataSetObserver;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationUpdate;
import com.myjobpitch.api.data.Experience;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobSeekerContainer;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateApplicationTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.UpdateApplicationTask;
import com.myjobpitch.tasks.recruiter.ReadApplicationsTask;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;

import java.util.ArrayList;
import java.util.List;

public class JobActivity extends MJPProgressActionBarActivity {

    private SwipeFlingAdapterView.OnItemClickListener onItemClickListener;
    private SwipeFlingAdapterView.onFlingListener onFlingListener;
    private FrameLayout mCardContainer;
    private DataSetObserver dataSetObserver;
    private TextView mPositiveButtonText;
    private View mPositiveButtonContainer;
    private ImageView mPositiveButtonIcon;
    private View mNegativeButtonContainer;
    private TextView mNegativeButtonText;
    private View mShortlistButtonContainer;
    private ImageView mShortlistButtonIcon;

    private enum CardState {
        LEFT, MIDDLE, RIGHT
    }

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

    class JobSeekerAdapter extends ArrayAdapter<JobSeekerContainer> {
        public JobSeekerAdapter(List<JobSeekerContainer> list) {
            super(JobActivity.this, R.layout.list_item, list);
        }

        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            JobSeekerContainer jobSeekerContainer = this.getItem(position);
            JobSeeker jobSeeker = jobSeekerContainer.getJobSeeker();
            Log.d("JobSeekerAdapter", "getView("+ jobSeeker.getFirst_name() + ")");

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

            if (jobSeekerContainer instanceof Application) {
                Application application = (Application) jobSeekerContainer;
                if (application.getShortlisted())
                    cardView.findViewById(R.id.shortlisted_indicator).setVisibility(View.VISIBLE);
            }

            return cardView;
        }
    }

    private Integer job_id;
    private SwipeFlingAdapterView mCards;
    private List<JobSeekerContainer> jobSeekers;
    private JobSeekerAdapter adapter;

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
                loadData();
            }
        });
        mShortListedSwitch = (Switch) findViewById(R.id.shortlisted_switch);
        mShortListedSwitch.setEnabled(true);
        mShortListedSwitch.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                loadData();
            }
        });

        mPositiveButtonContainer = findViewById(R.id.positive_button_container);
        Button mPositiveButton = (Button) findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    if (mAppliedSwitch.isChecked()) {
                        // TODO open messages
                    } else {
                        mButtonActivation = true;
                        mCards.getTopCardListener().selectLeft();
                    }
                }
            }
        });
        mPositiveButtonText = (TextView) findViewById(R.id.positive_button_text);
        mPositiveButtonIcon = (ImageView) findViewById(R.id.positive_button_icon);

        mNegativeButtonContainer = findViewById(R.id.negative_button_container);
        Button mNegativeButton = (Button) findViewById(R.id.negative_button);
        mNegativeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    JobSeeker jobSeeker = adapter.getItem(0).getJobSeeker();
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
        mNegativeButtonText = (TextView) findViewById(R.id.negative_button_text);

        mShortlistButtonContainer = findViewById(R.id.shortlist_button_container);
        Button mShortlistButton = (Button) findViewById(R.id.shortlist_button);
        mShortlistButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Application application = (Application) adapter.getItem(0);
                if (application.getShortlisted())
                    Toast.makeText(JobActivity.this, getString(R.string.removed_from_shortlist), Toast.LENGTH_SHORT).show();
                else
                    Toast.makeText(JobActivity.this, getString(R.string.added_to_shortlist), Toast.LENGTH_SHORT).show();
                application.setShortlisted(!application.getShortlisted());
                UpdateApplicationTask task = new UpdateApplicationTask(getApi(), new ApplicationUpdate(application));
                backgroundTaskManager.addBackgroundTask(task);
                mBackgroundProgress.setVisibility(View.VISIBLE);
                task.execute();

                View card = mCards.getSelectedView();
                View shortlistIndicator = card.findViewById(R.id.shortlisted_indicator);
                if (application.getShortlisted())
                    shortlistIndicator.setVisibility(View.VISIBLE);
                else
                    shortlistIndicator.setVisibility(View.INVISIBLE);

                if (mShortListedSwitch.isChecked()) {
                    mButtonActivation = true;
                    mCards.getTopCardListener().selectRight();
                } else {
                    update();
                }
            }
        });
        mShortlistButtonIcon = (ImageView) findViewById(R.id.shortlist_button_icon);

        mCardContainer = (FrameLayout) findViewById(R.id.job_seeker_cards);

        jobSeekers = new ArrayList();

        dataSetObserver = new DataSetObserver() {
            @Override
            public void onChanged() {
                update();
            }

            @Override
            public void onInvalidated() {
                update();
            }
        };

        onFlingListener = new SwipeFlingAdapterView.onFlingListener() {
            private View card;
            private TextView hint;
            public CardState cardState;

            @Override
            public void removeFirstObjectInAdapter() {
            }

            @Override
            public void onLeftCardExit(Object dataObject) {
                JobSeekerContainer jobSeekerContainer = jobSeekers.remove(0);
                JobSeeker jobSeeker = jobSeekerContainer.getJobSeeker();
                if (mAppliedSwitch.isChecked()) {
                    // Add to end of list so list loops around
                    jobSeekers.add(jobSeekerContainer);
                } else {
                    // Create application for job seeker
                    ApplicationForCreation application = new ApplicationForCreation();
                    application.setJob(job_id);
                    application.setJob_seeker(jobSeeker.getId());
                    application.setStatus(getMJPApplication().get(ApplicationStatus.class, "CREATED").getId());
                    application.setShortlisted(false);
                    CreateApplicationTask task = new CreateApplicationTask(getApi(), application);
                    backgroundTaskManager.addBackgroundTask(task);
                    mBackgroundProgress.setVisibility(View.VISIBLE);
                    task.execute();
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onRightCardExit(Object dataObject) {
                JobSeekerContainer jobSeekerContainer = jobSeekers.remove(0);
                if (mAppliedSwitch.isChecked()) {
                    if (!mButtonActivation) {
                        // Add to end of list so list loops around
                        jobSeekers.add(jobSeekerContainer);
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
                if (card != mCards.getSelectedView()) {
                    card = mCards.getSelectedView();
                    hint = (TextView) card.findViewById(R.id.hint);
                    cardState = null;
                }
                CardState newState;
                if (v > 0.4) {
                    newState = CardState.RIGHT;
                } else if (v < -0.4) {
                    newState = CardState.LEFT;
                } else {
                    newState = CardState.MIDDLE;
                }
                if (!newState.equals(cardState)) {
                    cardState = newState;
                    switch (cardState) {
                        case LEFT:
                            hint.setVisibility(View.VISIBLE);
                            if (mAppliedSwitch.isChecked()) {
                                hint.setText(R.string.next);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            } else {
                                hint.setText(R.string.connect);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            }
                            break;
                        case RIGHT:
                            hint.setVisibility(View.VISIBLE);
                            if (mAppliedSwitch.isChecked()) {
                                hint.setText(R.string.next);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            } else {
                                hint.setText(R.string.dismiss);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_negative));
                            }
                            break;
                        case MIDDLE:
                            hint.setVisibility(View.GONE);
                            break;
                    }
                }
            }
        };
        onItemClickListener = new SwipeFlingAdapterView.OnItemClickListener() {
            @Override
            public void onItemClicked(int itemPosition, Object dataObject) {
                Toast.makeText(JobActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
            }
        };
        createCardView();
    }

    private void createCardView() {
        mCardContainer.removeAllViews();
        adapter = new JobSeekerAdapter(jobSeekers);
        adapter.registerDataSetObserver(dataSetObserver);
        mCards = new SwipeFlingAdapterView(this);
        mCards.setFlingListener(onFlingListener);
        mCards.setOnItemClickListener(onItemClickListener);
        mCards.setAdapter(adapter);
        mCardContainer.addView(mCards);
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadData();
    }

    private void updateList(List<? extends JobSeekerContainer> result) {
        try {
            showProgress(false);
            jobSeekers.clear();
            jobSeekers.addAll(result);
            createCardView();
            adapter.notifyDataSetChanged();
        } catch (Exception e) {
            e.printStackTrace(System.err);
        }
    }

    private void loadData() {
        showProgress(true);
        if (mAppliedSwitch.isChecked()) {
            ReadApplicationsTask task = new ReadApplicationsTask(getApi(), job_id, mShortListedSwitch.isChecked());
            task.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
                @Override
                public void onSuccess(List<Application> result) {
                    updateList(result);
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
            task.execute();
        } else {
            ReadJobSeekersTask task = new ReadJobSeekersTask(getApi(), job_id);
            task.addListener(new CreateReadUpdateAPITaskListener<List<JobSeeker>>() {
                @Override
                public void onSuccess(List<JobSeeker> result) {
                    updateList(result);
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
            task.execute();
        }
    }

    private void update() {
        boolean notEmpty = adapter.getCount() > 0;
        if (mAppliedSwitch.isChecked()) {
            mPositiveButtonText.setText(getString(R.string.messages));
            mPositiveButtonIcon.setImageDrawable(getResources().getDrawable(R.drawable.ic_messages));
            mShortlistButtonContainer.setVisibility(View.VISIBLE);
            if (notEmpty) {
                if (adapter.getItem(0) instanceof Application) {
                    Application application = (Application) adapter.getItem(0);
                    Drawable drawable = getResources().getDrawable(application.getShortlisted() ? R.drawable.ic_star_remove : R.drawable.ic_star);
                    mShortlistButtonIcon.setImageDrawable(drawable);
                }
            }
        } else {
            mPositiveButtonText.setText(getString(R.string.connect));
            mPositiveButtonIcon.setImageDrawable(getResources().getDrawable(R.drawable.ic_connect));
            mShortlistButtonContainer.setVisibility(View.GONE);
        }
        mNegativeButtonText.setText(getString(R.string.remove));
        mShortlistButtonContainer.setEnabled(notEmpty);
        mPositiveButtonContainer.setEnabled(notEmpty);
        mNegativeButtonContainer.setEnabled(notEmpty);
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
