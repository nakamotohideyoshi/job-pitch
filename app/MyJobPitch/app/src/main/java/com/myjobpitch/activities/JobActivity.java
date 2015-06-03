package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.DataSetObserver;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CompoundButton;
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
import com.myjobpitch.api.data.ApplicationUpdate;
import com.myjobpitch.api.data.Experience;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobSeekerContainer;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateApplicationTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadApplicationsTask;
import com.myjobpitch.tasks.UpdateApplicationTask;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;
import com.myjobpitch.tasks.recruiter.ReadUserJobTask;

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
    private SwipeFlingAdapterView mCards;
    private List<JobSeekerContainer> jobSeekers;
    private JobSeekerAdapter adapter;
    private Object loadingLock = new Object();

    private Job job;
    private Integer job_id;
    private View mEmptyView;
    private TextView mEmptyMessageView;
    private TextView mEmptyButtonView;
    private TextView mEmptyButtonView2;
    private List<Integer> dismissed = new ArrayList<>();
    private ReadAPITask<?> loadingTask;
    private int lastLoadCount = 0;

    private enum CardState {
        LEFT, MIDDLE, RIGHT
    }

    private BackgroundTaskManager backgroundTaskManager;

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

        mJobSeekerSearchView = findViewById(R.id.job_seeker_search);
        mProgressView = findViewById(R.id.progress);
        mBackgroundProgress = findViewById(R.id.background_progress);

        mAppliedSwitch = (Switch) findViewById(R.id.applied_switch);
        mAppliedSwitch.setChecked(true);
        mAppliedSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                mShortListedSwitch.setEnabled(isChecked);
                loadDataPreserveSeenAndClearCards();
            }
        });
        mShortListedSwitch = (Switch) findViewById(R.id.shortlisted_switch);
        mShortListedSwitch.setEnabled(true);
        mShortListedSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                loadDataPreserveSeenAndClearCards();
            }
        });

        mPositiveButtonContainer = findViewById(R.id.positive_button_container);
        Button mPositiveButton = (Button) findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    if (mAppliedSwitch.isChecked()) {
                        Application application = (Application) adapter.getItem(0);
                        Intent intent = new Intent(JobActivity.this, ConversationThreadActivity.class);
                        intent.putExtra("application_id", application.getId());
                        startActivity(intent);
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
                    String message = getString(R.string.remove_job_seeker_message, name);

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
        final Button mShortlistButton = (Button) findViewById(R.id.shortlist_button);
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
                    application.setJob(job.getId());
                    application.setJob_seeker(jobSeeker.getId());
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
                    dismissed.add(jobSeekerContainer.getJobSeeker().getId());
                    if (mButtonActivation) {
                        // Mark job seeker as ineligible for searches
                        // TODO permanently exclude
                    }
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onAdapterAboutToEmpty(int itemsInAdapter) {
                synchronized (loadingLock) {
                    Log.d("swipe", "onAdapterAboutToEmpty(" + itemsInAdapter + "): lastLoadCount = " + lastLoadCount);
                    if (!mAppliedSwitch.isChecked() && lastLoadCount != 0)
                        loadDataPreserveSeenAndAppendCardsInBackground();
                }
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

        mEmptyView = findViewById(android.R.id.empty);
        mEmptyMessageView = (TextView) findViewById(R.id.empty_view_message);
        mEmptyButtonView = (TextView) findViewById(R.id.empty_view_button);
        mEmptyButtonView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mAppliedSwitch.isChecked()) {
                    if (mShortListedSwitch.isChecked())
                        mShortListedSwitch.performClick();
                    else
                        mAppliedSwitch.performClick();
                } else
                    loadDataClearSeenAndClearCards();
            }
        });
        mEmptyButtonView2 = (TextView) findViewById(R.id.empty_view_button_2);
        mEmptyButtonView2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                mAppliedSwitch.performClick();
            }
        });

        updateEmptyView();
        createCardView();

        job_id = getIntent().getIntExtra("job_id", -1);
        loadJob();
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

    private void updateEmptyView() {
        if (mAppliedSwitch.isChecked()) {
            if (mShortListedSwitch.isChecked()) {
                mEmptyMessageView.setText(getString(R.string.no_shortlisted_applications_message));
                mEmptyButtonView.setText(getString(R.string.turn_off_shortlist_view));
            } else {
                mEmptyMessageView.setText(getString(R.string.no_applications_message));
                mEmptyButtonView.setText(getString(R.string.switch_to_search_mode));
            }
            mEmptyButtonView2.setVisibility(View.GONE);
        } else {
            mEmptyMessageView.setText(getString(R.string.no_matching_candidates_message));
            mEmptyButtonView.setText(getString(R.string.restart_search));
            mEmptyButtonView2.setText(getString(R.string.switch_to_application_mode));
            mEmptyButtonView2.setVisibility(View.VISIBLE);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    private void loadJob() {
        showProgress(true);
        ReadUserJobTask task = new ReadUserJobTask(getApi(), job_id);
        task.addListener(new CreateReadUpdateAPITaskListener<Job>() {
            @Override
            public void onSuccess(Job result) {
                job = result;
                getSupportActionBar().setTitle(job.getTitle());
                loadDataPreserveSeenAndAppendCards();
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobActivity.this, "Error loading job seekers", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onConnectionError() {
                Toast toast = Toast.makeText(JobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        task.execute();
    }

    private void updateList(List<? extends JobSeekerContainer> result, boolean append) {
        try {
            updateEmptyView();
            showProgress(false);
            lastLoadCount = result.size();
            if (append) {
                jobSeekers.addAll(result);
            } else {
                jobSeekers.clear();
                jobSeekers.addAll(result);
                createCardView();
            }
            adapter.notifyDataSetChanged();
        } catch (Exception e) {
            e.printStackTrace(System.err);
        }
    }

    private void loadDataClearSeenAndClearCards() {
        loadData(true, false, true, false);
    }

    private void loadDataPreserveSeenAndAppendCardsInBackground() {
        loadData(false, true, false, true);
    }

    private void loadDataPreserveSeenAndClearCards() {
        loadData(false, false, true, false);
    }
    private void loadDataPreserveSeenAndAppendCards() {
        loadData(false, true, true, false);
    }

    private void loadData(boolean clearDismissed, final boolean append, boolean cancel, boolean background) {
        synchronized (loadingLock) {
            if (loadingTask != null) {
                Log.d("JobActivity", "Task already running");
                if (cancel) {
                    Log.d("JobActivity", "Cancelling running loading task");
                    loadingTask.cancel(false);
                    loadingTask = null;
                } else
                    return;
            }
            if (!background)
                showProgress(true);
            if (mAppliedSwitch.isChecked()) {
                if (mShortListedSwitch.isChecked())
                    getSupportActionBar().setSubtitle(getString(R.string.shortlisted_job_seekers));
                else
                    getSupportActionBar().setSubtitle(getString(R.string.applied_job_seekers));
                Log.d("JobActivity", "Loading applications");
                ReadApplicationsTask task = new ReadApplicationsTask(getApi(), job.getId(), mShortListedSwitch.isChecked());
                loadingTask = task;
                task.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
                    @Override
                    public void onSuccess(List<Application> result) {
                        synchronized (loadingLock) {
                            Log.d("JobActivity", "Applications loaded");
                            loadingTask = null;
                            updateList(result, false);
                        }
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        synchronized (loadingLock) {
                            Log.d("JobActivity", "Error loading applications");
                            loadingTask = null;
                            Toast toast = Toast.makeText(JobActivity.this, "Error loading job seekers", Toast.LENGTH_LONG);
                            toast.show();
                            finish();
                        }
                    }

                    @Override
                    public void onConnectionError() {
                        Toast toast = Toast.makeText(JobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }

                    @Override
                    public void onCancelled() {
                        Log.d("JobActivity", "Application load cancelled");
                    }
                });
            } else {
                getSupportActionBar().setSubtitle(getString(R.string.job_seeker_search));
                List<Integer> exclude = new ArrayList();
                if (clearDismissed) {
                    Log.d("JobActivity", "Resetting dismissed");
                    dismissed.clear();
                } else {
                    // Exclude job seekers that have been dismissed, or are
                    // already in the list (that are actual jobseekers, not
                    // applications)
                    exclude.addAll(dismissed);
                    for (JobSeekerContainer jobSeeker : jobSeekers)
                        if (jobSeeker instanceof JobSeeker)
                            exclude.add(jobSeeker.getJobSeeker().getId());
                }

                Log.d("JobActivity", "Loading applications");
                ReadJobSeekersTask task = new ReadJobSeekersTask(getApi(), job.getId(), exclude);
                loadingTask = task;
                task.addListener(new CreateReadUpdateAPITaskListener<List<JobSeeker>>() {
                    @Override
                    public void onSuccess(List<JobSeeker> result) {
                        synchronized (loadingLock) {
                            Log.d("JobActivity", "Job seekers loaded");
                            loadingTask = null;
                            updateList(result, append);
                        }
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        synchronized (loadingLock) {
                            Log.d("JobActivity", "Error loading jobsseekers");
                            loadingTask = null;
                            Toast toast = Toast.makeText(JobActivity.this, "Error loading job seekers", Toast.LENGTH_LONG);
                            toast.show();
                            finish();
                        }
                    }

                    @Override
                    public void onConnectionError() {
                        Toast toast = Toast.makeText(JobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }

                    @Override
                    public void onCancelled() {
                        Log.d("JobActivity", "Job sseeker load cancelled");
                    }
                });
            }
            if (background) {
                mBackgroundProgress.setVisibility(View.VISIBLE);
                backgroundTaskManager.addBackgroundTask(loadingTask);
            }
            loadingTask.execute();
        }
    }

    private void update() {
        boolean notEmpty = adapter.getCount() > 0;
        if (mAppliedSwitch.isChecked()) {
            mPositiveButtonText.setText(getString(R.string.messages));
            mPositiveButtonIcon.setImageDrawable(getResources().getDrawable(R.drawable.ic_email_blue));
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
        synchronized (loadingLock) {
            if (notEmpty || loadingTask != null) {
                mEmptyView.setVisibility(View.INVISIBLE);
                mCards.setVisibility(View.VISIBLE);
            } else {
                mEmptyView.setVisibility(View.VISIBLE);
                mCards.setVisibility(View.INVISIBLE);
            }
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.job, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
                if (job != null) {
                    intent = NavUtils.getParentActivityIntent(JobActivity.this);
                    intent.putExtra("location_id", job.getLocation());
                    startActivity(intent);
                }
                return true;
            case R.id.action_messages:
                startActivity(new Intent(JobActivity.this, ConversationListActivity.class));
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
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
