package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.database.DataSetObserver;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.text.method.ScrollingMovementMethod;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.R;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.Image;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.CreateApplicationTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.jobseeker.ReadJobsTask;
import com.myjobpitch.tasks.jobseeker.ReadUserJobSeekerTask;

import java.util.ArrayList;
import java.util.List;

public class JobSeekerActivity extends MJPProgressActionBarActivity {


    private SwipeFlingAdapterView.OnItemClickListener onItemClickListener;
    private SwipeFlingAdapterView.onFlingListener onFlingListener;
    private FrameLayout mCardContainer;
    private DataSetObserver dataSetObserver;
    private View mPositiveButtonContainer;
    private View mNegativeButtonContainer;

    private SwipeFlingAdapterView mCards;
    private List<Job> jobs;
    private JobAdapter adapter;
    private Object loadingLock = new Object();

    private JobSeeker mJobSeeker;
    private View mEmptyView;
    private TextView mEmptyMessageView;
    private TextView mEmptyButtonView;
    private List<Integer> dismissed = new ArrayList<>();
    private ReadJobsTask loadingTask;
    private int lastLoadCount = 0;
    private Handler mHandler = new Handler();;

    private enum CardState {
        LEFT, MIDDLE, RIGHT
    }

    private BackgroundTaskManager backgroundTaskManager;

    private View mProgressView;
    private View mJobSeekerView;
    private boolean mButtonActivation = false;
    private View mBackgroundProgress;

    class JobAdapter extends CachingArrayAdapter<Job> {

        public JobAdapter(List<Job> list) {
            super(JobSeekerActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, Job job) {
            Log.d("JobAdapter", "getView(" + job.getTitle() + ")");

            LayoutInflater inflater = (LayoutInflater) JobSeekerActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View cardView = inflater.inflate(R.layout.card_job, parent, false);

            TextView titleView = (TextView) cardView.findViewById(R.id.job_title);
            titleView.setText(job.getTitle());

            TextView extraView = (TextView) cardView.findViewById(R.id.job_extra);
            String extraText = getMJPApplication().get(Hours.class, job.getHours()).getName();
            Contract contract = getMJPApplication().get(Contract.class, job.getContract());
            if (!contract.equals(getMJPApplication().get(Contract.class, Contract.PERMANENT)))
                extraText += "(" + contract.getShort_name() + ")";
            extraView.setText(extraText);

            TextView descriptionView = (TextView) cardView.findViewById(R.id.job_description);
            String description = String.format("%s - %s\n%s",
                    job.getLocation_data().getBusiness_data().getName(),
                    job.getLocation_data().getName(),
                    job.getDescription()
            );
            descriptionView.setText(description);
            descriptionView.setMovementMethod(new ScrollingMovementMethod());

            ImageView imageView = (ImageView) cardView.findViewById(R.id.image);
            ProgressBar progress = (ProgressBar) cardView.findViewById(R.id.progress);
            TextView noImageView = (TextView) cardView.findViewById(R.id.no_image);
            Image image = null;
            if (job.getImages() != null && !job.getImages().isEmpty())
                image = job.getImages().get(0);
            else if (job.getLocation_data().getImages() != null && !job.getLocation_data().getImages().isEmpty())
                image = job.getLocation_data().getImages().get(0);
            else if (job.getLocation_data().getBusiness_data().getImages() != null && !job.getLocation_data().getBusiness_data().getImages().isEmpty())
                image = job.getLocation_data().getBusiness_data().getImages().get(0);
            if (image != null) {
                Uri uri = Uri.parse(image.getThumbnail());
                new DownloadImageTask(JobSeekerActivity.this, imageView, progress).execute(uri);
            } else {
                progress.setVisibility(View.INVISIBLE);
                noImageView.setVisibility(View.VISIBLE);
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
        setContentView(R.layout.activity_job_seeker);

        mJobSeekerView = findViewById(R.id.job_seeker_main);
        mProgressView = findViewById(R.id.progress);
        mBackgroundProgress = findViewById(R.id.background_progress);

        mPositiveButtonContainer = findViewById(R.id.positive_button_container);
        Button mPositiveButton = (Button) findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    mButtonActivation = true;
                    mCards.getTopCardListener().selectLeft();
                }
            }
        });

        mNegativeButtonContainer = findViewById(R.id.negative_button_container);
        Button mNegativeButton = (Button) findViewById(R.id.negative_button);
        mNegativeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    Job job = adapter.getItem(0);
                    String name = job.getTitle();
                    String message = getString(R.string.remove_job_message, name);

                    AlertDialog.Builder builder = new AlertDialog.Builder(JobSeekerActivity.this);
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

        mCardContainer = (FrameLayout) findViewById(R.id.job_cards);

        jobs = new ArrayList();

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
                Job job = jobs.remove(0);
                // Create application for job seeker
                ApplicationForCreation application = new ApplicationForCreation();
                application.setJob(job.getId());
                application.setJob_seeker(mJobSeeker.getId());
                application.setShortlisted(false);
                CreateApplicationTask task = new CreateApplicationTask(getApi(), application);
                backgroundTaskManager.addBackgroundTask(task);
                mBackgroundProgress.setVisibility(View.VISIBLE);
                task.execute();
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onRightCardExit(Object dataObject) {
                Job job = jobs.remove(0);
                dismissed.add(job.getId());
                if (mButtonActivation) {
                    // Mark job as ineligible for searches
                    // TODO permanently exclude
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onAdapterAboutToEmpty(final int itemsInAdapter) {
                mHandler.post(new Runnable() {
                    @Override
                    public void run() {
                        synchronized (loadingLock) {
                            Log.d("swipe", "onAdapterAboutToEmpty(" + itemsInAdapter + "): lastLoadCount = " + lastLoadCount);
                            if (lastLoadCount != 0)
                                loadDataPreserveSeenAndAppendCardsInBackground();
                        }
                    }
                });
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
                            hint.setText(R.string.connect);
                            hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            break;
                        case RIGHT:
                            hint.setVisibility(View.VISIBLE);
                            hint.setText(R.string.dismiss);
                            hint.setTextColor(getResources().getColor(R.color.card_hint_negative));
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
                Toast.makeText(JobSeekerActivity.this, "Clicked!", Toast.LENGTH_SHORT).show();
            }
        };

        mEmptyView = findViewById(android.R.id.empty);
        mEmptyMessageView = (TextView) findViewById(R.id.message_box_message);
        mEmptyButtonView = (Button) findViewById(R.id.empty_button);
        mEmptyButtonView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mJobSeeker.getProfile() == null)
                    editProfile();
                else
                    loadDataClearSeenAndClearCards();
            }
        });

        createCardView();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadJobSeeker();
    }

    private void loadJobSeeker() {
        showProgress(true);
        ReadUserJobSeekerTask readJobSeekerTask = new ReadUserJobSeekerTask(getApi());
        readJobSeekerTask.addListener(new CreateReadUpdateAPITaskListener<JobSeeker>() {
            @Override
            public void onSuccess(JobSeeker result) {
                mJobSeeker = result;
                if (mJobSeeker.getProfile() == null) {
                    mEmptyView.setVisibility(View.VISIBLE);
                    mEmptyMessageView.setText(getString(R.string.setup_profile_message));
                    mEmptyButtonView.setText(getString(R.string.setup_profile));
                    showProgress(false);
                } else {
                    mEmptyMessageView.setText(getString(R.string.no_matching_jobs_message));
                    mEmptyButtonView.setText(getString(R.string.restart_search));
                    mEmptyView.setVisibility(View.INVISIBLE);
                    loadDataPreserveSeenAndClearCards();
                }
            }

            @Override
            public void onError(JsonNode errors) {
                Toast toast = Toast.makeText(JobSeekerActivity.this, "Error loading job seeker", Toast.LENGTH_LONG);
                toast.show();
                finish();
            }

            @Override
            public void onCancelled() {
            }
        });
        readJobSeekerTask.execute();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.job_seeker, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch (item.getItemId()) {
            case R.id.action_edit_profile:
                startActivity(new Intent(this, EditJobSeekerActivity.class));
                return true;
            case R.id.action_edit_job_profile:
                editProfile();
                return true;
            case R.id.action_messages:
                // TODO open messages
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    private void createCardView() {
        mCardContainer.removeAllViews();
        adapter = new JobAdapter(jobs);
        adapter.registerDataSetObserver(dataSetObserver);
        mCards = new SwipeFlingAdapterView(this);
        mCards.setFlingListener(onFlingListener);
        mCards.setOnItemClickListener(onItemClickListener);
        mCards.setAdapter(adapter);
        mCardContainer.addView(mCards);
    }

    private void updateList(List<Job> result, boolean append) {
        try {
            showProgress(false);
            lastLoadCount = result.size();
            if (append) {
                jobs.addAll(result);
            } else {
                jobs.clear();
                jobs.addAll(result);
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

    private void loadData(boolean clearDismissed, final boolean append, boolean cancel, boolean background) {
        synchronized (loadingLock) {
            if (loadingTask != null) {
                Log.d("JobSeekerActivity", "Task already running");
                if (cancel) {
                    Log.d("JobSeekerActivity", "Cancelling running loading task");
                    loadingTask.cancel(false);
                    loadingTask = null;
                } else
                    return;
            }
            if (!background)
                showProgress(true);
            List<Integer> exclude = new ArrayList();
            if (clearDismissed) {
                Log.d("JobSeekerActivity", "Resetting dismissed");
                dismissed.clear();
            } else {
                // Exclude jobs that have been dismissed, or are
                // already in the list
                exclude.addAll(dismissed);
                for (Job job : jobs)
                    exclude.add(job.getId());
            }

            Log.d("JobActivity", "Loading jobs");
            ReadJobsTask task = new ReadJobsTask(getApi(), exclude);
            loadingTask = task;
            task.addListener(new CreateReadUpdateAPITaskListener<List<Job>>() {
                @Override
                public void onSuccess(List<Job> result) {
                    synchronized (loadingLock) {
                        Log.d("JobActivity", "Jobs loaded");
                        loadingTask = null;
                        updateList(result, append);
                    }
                }

                @Override
                public void onError(JsonNode errors) {
                    synchronized (loadingLock) {
                        Log.d("JobActivity", "Error loading jobs");
                        loadingTask = null;
                        Toast toast = Toast.makeText(JobSeekerActivity.this, "Error loading jobs", Toast.LENGTH_LONG);
                        toast.show();
                        finish();
                    }
                }

                @Override
                public void onCancelled() {
                    Log.d("JobActivity", "Job load cancelled");
                }
            });
            if (background) {
                mBackgroundProgress.setVisibility(View.VISIBLE);
                backgroundTaskManager.addBackgroundTask(loadingTask);
            }
            loadingTask.execute();
        }
    }

    private void update() {
        boolean notEmpty = adapter.getCount() > 0;
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

    private void editProfile() {
        Intent intent;
        intent = new Intent(this, EditJobProfileActivity.class);
        intent.putExtra("job_seeker_id", getApi().getUser().getJob_seeker());
        startActivity(intent);
    }

    @Override
    public View getMainView() {
        return mJobSeekerView;
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }
}
