package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.database.DataSetObserver;
import android.graphics.Bitmap;
import android.graphics.Point;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CompoundButton;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lorentzos.flingswipe.SwipeFlingAdapterView;
import com.myjobpitch.BuildConfig;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobSeekerContainer;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.tasks.CreateApplicationTask;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.DownloadImageTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadApplicationsTask;
import com.myjobpitch.tasks.UpdateApplicationShortlistTask;
import com.myjobpitch.tasks.UpdateApplicationStatusTask;
import com.myjobpitch.tasks.recruiter.ReadJobSeekersTask;
import com.myjobpitch.tasks.recruiter.ReadUserJobTask;
import com.myjobpitch.utils.ToolTipHelper;

import java.util.ArrayList;
import java.util.List;

import it.sephiroth.android.library.tooltip.Tooltip;

public class JobActivity extends MJPProgressActionBarActivity {

    public static final String TAG = "JobActivity";
    public static final String SEARCH = "SEARCH";
    public static final String APPLICATIONS = "APPLICATIONS";
    public static final String MYSHORTLIST = "MYSHORTLIST";
    public static final String CONNECTIONS = "CONNECTIONS";
    public static final String MODE = "MODE";
    public static final String JOB_ID = "JOB_ID";

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
    private String mode;
    private View mEmptyView;
    private TextView mEmptyMessageView;
    private TextView mEmptyButtonView;
    private List<Integer> dismissed = new ArrayList<>();
    private ReadAPITask<?> loadingTask;
    private int lastLoadCount = 0;
    private View mButtons;

    private enum CardState {
        LEFT, MIDDLE, RIGHT
    }

    private BackgroundTaskManager backgroundTaskManager;

    private View mProgressView;
    private View mJobSeekerSearchView;
    private Switch mShortListedSwitch;
    private boolean mButtonActivation = false;
    private View mBackgroundProgress;


    private ToolTipHelper toolTipHelper;

    class JobSeekerAdapter extends CachingArrayAdapter<JobSeekerContainer> {

        public TextView descriptionView;

        public JobSeekerAdapter(List<JobSeekerContainer> list) {
            super(JobActivity.this, R.layout.list_item, list);
        }

        @Override
        public View createView(int position, View convertView, ViewGroup parent, JobSeekerContainer jobSeekerContainer) {
            final JobSeeker jobSeeker = jobSeekerContainer.getJobSeeker();
            Log.d("JobSeekerAdapter", "getView("+ jobSeeker.getFirst_name() + ")");

            LayoutInflater inflater = (LayoutInflater) JobActivity.this.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            View cardView = inflater.inflate(R.layout.card_job_seeker, parent, false);

            TextView nameView = (TextView) cardView.findViewById(R.id.job_seeker_name);
            final String name = jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name();
            nameView.setText(name);
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
            descriptionView = (TextView) cardView.findViewById(R.id.job_seeker_description);
            descriptionView.setText(jobSeeker.getDescription());

            if (jobSeekerContainer instanceof Application) {
                Application application = (Application) jobSeekerContainer;
                if (application.getShortlisted())
                    cardView.findViewById(R.id.shortlisted_indicator).setVisibility(View.VISIBLE);
            }

            ImageView imageView = (ImageView) cardView.findViewById(R.id.image);
            final ProgressBar progress = (ProgressBar) cardView.findViewById(R.id.progress);
            final TextView noImageView = (TextView) cardView.findViewById(R.id.no_image);
            final ImageView playButton = (ImageView) cardView.findViewById(R.id.play_button);
            String imageUri = null;
            if (jobSeeker.hasPitch())
                imageUri = jobSeeker.getPitch().getThumbnail();

            if (imageUri != null) {
                Uri uri = Uri.parse(imageUri);
                DownloadImageTask downloadImageTask = new DownloadImageTask(JobActivity.this, imageView, progress);
                downloadImageTask.setListener(new DownloadImageTask.DownloadImageTaskListener() {
                    @Override
                    public void onComplete(Bitmap bitmap) {
                        playButton.setVisibility(View.VISIBLE);
                    }

                    @Override
                    public void onError() {
                        progress.setVisibility(View.INVISIBLE);
                        noImageView.setVisibility(View.VISIBLE);
                    }
                });
                downloadImageTask.executeOnExecutor(DownloadImageTask.executor, uri);
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
        setContentView(R.layout.activity_job);

        mJobSeekerSearchView = findViewById(R.id.job_seeker_search);
        mProgressView = findViewById(R.id.progress);
        mBackgroundProgress = findViewById(R.id.background_progress);

        mShortListedSwitch = (Switch) findViewById(R.id.shortlisted_switch);
        mShortListedSwitch.setEnabled(true);
        mShortListedSwitch.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener() {
            @Override
            public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
                loadDataPreserveSeenAndClearCards();
            }
        });

        mButtons = findViewById(R.id.buttons);

        mPositiveButtonContainer = findViewById(R.id.positive_button_container);
        Button mPositiveButton = (Button) findViewById(R.id.positive_button);
        mPositiveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!adapter.isEmpty()) {
                    if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                        Application application = (Application) adapter.getItem(0);
                        Intent intent = new Intent(JobActivity.this, ConversationThreadActivity.class);
                        intent.putExtra(ConversationThreadActivity.APPLICATION_ID, application.getId());
                        startActivity(intent);
                    } else {
                        mButtonActivation = true;
                        mCards.getTopCardListener().selectRight();
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
                                    mCards.getTopCardListener().selectLeft();
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
                View card = mCards.getSelectedView();
                final View shortlistIndicator = card.findViewById(R.id.shortlisted_indicator);

                final Application application = (Application) adapter.getItem(0);
                if (application.getShortlisted())
                    Toast.makeText(JobActivity.this, getString(R.string.removed_from_shortlist), Toast.LENGTH_SHORT).show();
                else
                    Toast.makeText(JobActivity.this, getString(R.string.added_to_shortlist), Toast.LENGTH_SHORT).show();
                application.setShortlisted(!application.getShortlisted());
                UpdateApplicationShortlistTask task = new UpdateApplicationShortlistTask(getApi(), new ApplicationShortlistUpdate(application));
                task.addListener(new CreateReadUpdateAPITaskListener<ApplicationShortlistUpdate>() {
                    @Override
                    public void onSuccess(ApplicationShortlistUpdate result) {
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        toggleShortlistIndicator(shortlistIndicator, application);
                        JobSeeker jobSeeker = application.getJobSeeker();
                        Toast toast = Toast.makeText(JobActivity.this, "Error shortlisting " + jobSeeker.getFirst_name() + " " + jobSeeker.getLast_name(), Toast.LENGTH_LONG);
                        toast.show();
                    }

                    @Override
                    public void onConnectionError() {
                        toggleShortlistIndicator(shortlistIndicator, application);
                        Toast toast = Toast.makeText(JobActivity.this, "Connection Error: Please check your internet connection", Toast.LENGTH_LONG);
                        toast.show();
                    }

                    @Override
                    public void onCancelled() {
                        toggleShortlistIndicator(shortlistIndicator, application);
                    }
                });
                backgroundTaskManager.addBackgroundTask(task);
                mBackgroundProgress.setVisibility(View.VISIBLE);
                task.execute();

                toggleShortlistIndicator(shortlistIndicator, application);

                if (mShortListedSwitch.isChecked()) {
                    mButtonActivation = true;
                    mCards.getTopCardListener().selectRight();
                } else {
                    update();
                }
            }

            private void toggleShortlistIndicator(View shortlistIndicator, Application application) {
                if (application.getShortlisted())
                    shortlistIndicator.setVisibility(View.VISIBLE);
                else
                    shortlistIndicator.setVisibility(View.INVISIBLE);
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
            public void onRightCardExit(Object dataObject) {
                JobSeekerContainer jobSeekerContainer = jobSeekers.remove(0);
                JobSeeker jobSeeker = jobSeekerContainer.getJobSeeker();
                if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                    // Add to end of list so list loops around
                    jobSeekers.add(jobSeekerContainer);
                } else if (mode.equals(SEARCH)) {
                    // Create application for job seeker
                    ApplicationForCreation application = new ApplicationForCreation();
                    application.setJob(job.getId());
                    application.setJob_seeker(jobSeeker.getId());
                    application.setShortlisted(false);
                    CreateApplicationTask task = new CreateApplicationTask(getApi(), application);
                    task.addListener(new CreateReadUpdateAPITaskListener<ApplicationForCreation>() {
                        @Override
                        public void onSuccess(ApplicationForCreation result) {
                        }

                        @Override
                        public void onError(JsonNode errors) {
                            if (errors.has(0) && errors.get(0).asText().equals("NO_TOKENS")) {
                                AlertDialog.Builder builder = new AlertDialog.Builder(JobActivity.this);
                                builder.setMessage(getString(R.string.no_tokens_error))
                                        .setCancelable(false)
                                        .setPositiveButton(getString(R.string.ok), new DialogInterface.OnClickListener() {
                                            public void onClick(DialogInterface dialog, int id) {
                                                dialog.cancel();
                                            }
                                        }).create().show();
                            }
                        }

                        @Override
                        public void onConnectionError() {
                        }

                        @Override
                        public void onCancelled() {
                        }
                    });
                    backgroundTaskManager.addBackgroundTask(task);
                    mBackgroundProgress.setVisibility(View.VISIBLE);
                    task.execute();
                } else if (mode.equals(APPLICATIONS)) {
                    Application application = (Application) jobSeekerContainer;
                    application.setStatus(getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId());
                    ApplicationStatusUpdate applicationUpdate = new ApplicationStatusUpdate(application);
                    UpdateApplicationStatusTask task = new UpdateApplicationStatusTask(getApi(), applicationUpdate);
                    backgroundTaskManager.addBackgroundTask(task);
                    mBackgroundProgress.setVisibility(View.VISIBLE);
                    task.execute();
                }
                adapter.notifyDataSetChanged();
                mButtonActivation = false;
            }

            @Override
            public void onLeftCardExit(Object dataObject) {
                JobSeekerContainer jobSeekerContainer = jobSeekers.remove(0);
                if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                    if (!mButtonActivation) {
                        // Add to end of list so list loops around
                        jobSeekers.add(jobSeekerContainer);
                    }
                } else if (mode.equals(SEARCH)){
                    dismissed.add(jobSeekerContainer.getJobSeeker().getId());
                    if (mButtonActivation) {
                        // Mark job seeker as ineligible for searches
                        // TODO permanently exclude
                    }
                } else if (mode.equals(APPLICATIONS)){
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
                    if (mode.equals(SEARCH) && lastLoadCount != 0)
                        loadDataPreserveSeenAndAppendCardsInBackground();
                }
            }

            @Override
            public void onScroll(float v) {
                if (card != mCards.getSelectedView()) {
                    card = mCards.getSelectedView();
                    if (card == null)
                        return;
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
                        case RIGHT:
                            hint.setVisibility(View.VISIBLE);
                            if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                                hint.setText(R.string.next);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            } else {
                                hint.setText(R.string.connect);
                                hint.setTextColor(getResources().getColor(R.color.card_hint_positive));
                            }
                            break;
                        case LEFT:
                            hint.setVisibility(View.VISIBLE);
                            if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
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
                JobSeekerContainer jobSeekerContainer = adapter.getItem(itemPosition);
                JobSeeker jobSeeker = jobSeekerContainer.getJobSeeker();
                Intent intent = new Intent(JobActivity.this, JobSeekerDetailsActivity.class);
                ObjectMapper mapper = new ObjectMapper();
                try {
                    String jobSeekerData = mapper.writeValueAsString(jobSeeker);
                    intent.putExtra(JobSeekerDetailsActivity.JOB_SEEKER_DATA, jobSeekerData);
                    if (jobSeekerContainer instanceof Application) {
                        Application application = (Application) jobSeekerContainer;
                        String applicationData = mapper.writeValueAsString(application);
                        intent.putExtra(JobSeekerDetailsActivity.APPLICATION_DATA, applicationData);
                    }
                } catch (JsonProcessingException e) {}

                if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                    startActivity(intent);
                } else {
                    intent.putExtra("showConnectButton", true);
                    startActivityForResult(intent, 1);
                }

            }
        };

        mEmptyView = findViewById(android.R.id.empty);
        mEmptyMessageView = (TextView) findViewById(R.id.empty_view_message);
        mEmptyButtonView = (TextView) findViewById(R.id.empty_view_button);
        mEmptyButtonView.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (mode.equals(CONNECTIONS)) {
                    if (mShortListedSwitch.isChecked())
                        mShortListedSwitch.performClick();
                } else if (mode.equals(SEARCH))
                    loadDataClearSeenAndClearCards();
            }
        });

        job_id = getIntent().getIntExtra(JOB_ID, -1);
        mode = getIntent().getStringExtra(MODE);

        if (!mode.equals(CONNECTIONS))
            findViewById(R.id.controls).setVisibility(View.INVISIBLE);

        updateEmptyView();
        createCardView();
        loadJob();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == 1) {
            if (data != null && data.getBooleanExtra("connect", false)) {
                mButtonActivation = true;
                mCards.getTopCardListener().selectRight();
            }
        }
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
        if (mode.equals(CONNECTIONS)) {
            if (mShortListedSwitch.isChecked()) {
                mEmptyMessageView.setText(getString(R.string.no_shortlisted_applications_message));
                mEmptyButtonView.setText(getString(R.string.turn_off_shortlist_view));
                mEmptyButtonView.setVisibility(View.VISIBLE);
            } else {
                mEmptyMessageView.setText(getString(R.string.no_connections_message));
                mEmptyButtonView.setVisibility(View.GONE);
            }
        } else if (mode.equals(SEARCH)){
            mEmptyMessageView.setText(getString(R.string.no_matching_candidates_message));
            mEmptyButtonView.setText(getString(R.string.restart_search));
            mEmptyButtonView.setVisibility(View.VISIBLE);
        } else if (mode.equals(APPLICATIONS)){
            mEmptyMessageView.setText(getString(R.string.no_applications_message));
            mEmptyButtonView.setVisibility(View.GONE);
        } else if (mode.equals(MYSHORTLIST)) {
            mEmptyMessageView.setText(getString(R.string.no_shortlisted_applications_message));
            mEmptyButtonView.setVisibility(View.INVISIBLE);
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

                ((TextView)findViewById(R.id.tokensLabel)).setText(job.getLocation_data().getBusiness_data().getTokens() + " Credit");

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
                Log.d(TAG, "Task already running");
                if (cancel) {
                    Log.d(TAG, "Cancelling running loading task");
                    loadingTask.cancel(false);
                    loadingTask = null;
                } else
                    return;
            }
            if (!background)
                showProgress(true);
            if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
                if (mShortListedSwitch.isChecked() || mode.equals(MYSHORTLIST))
                    getSupportActionBar().setSubtitle(getString(R.string.shortlisted_job_seekers));
                else
                    getSupportActionBar().setSubtitle(getString(R.string.applied_job_seekers));
                Log.d(TAG, "Loading applications");
                Integer status = getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.ESTABLISHED).getId();
                ReadApplicationsTask task = new ReadApplicationsTask(getApi(), job.getId(), status, mShortListedSwitch.isChecked() || mode.equals(MYSHORTLIST));
                loadingTask = task;
                task.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
                    @Override
                    public void onSuccess(List<Application> result) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Applications loaded");
                            loadingTask = null;
                            updateList(result, false);
                        }
                        showHelp();
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Error loading applications");
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
                        Log.d(TAG, "Application load cancelled");
                    }
                });
            } else if (mode.equals(SEARCH)) {
                getSupportActionBar().setSubtitle(getString(R.string.job_seeker_search));
                List<Integer> exclude = new ArrayList();
                if (clearDismissed) {
                    Log.d(TAG, "Resetting dismissed");
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

                Log.d(TAG, "Loading applications");
                ReadJobSeekersTask task = new ReadJobSeekersTask(getApi(), job.getId(), exclude);
                loadingTask = task;
                task.addListener(new CreateReadUpdateAPITaskListener<List<JobSeeker>>() {
                    @Override
                    public void onSuccess(List<JobSeeker> result) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Job seekers loaded");
                            loadingTask = null;
                            updateList(result, append);
                        }
                        showHelp();
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Error loading jobsseekers");
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
                        Log.d(TAG, "Job sseeker load cancelled");
                    }
                });
            } else if (mode.equals(APPLICATIONS)) {
                getSupportActionBar().setSubtitle(getString(R.string.job_seeker_applications));
                Log.d(TAG, "Loading applications");
                Integer status = getMJPApplication().get(ApplicationStatus.class, ApplicationStatus.CREATED).getId();
                ReadApplicationsTask task = new ReadApplicationsTask(getApi(), job.getId(), status, mShortListedSwitch.isChecked());
                loadingTask = task;
                task.addListener(new CreateReadUpdateAPITaskListener<List<Application>>() {
                    @Override
                    public void onSuccess(List<Application> result) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Applications loaded");
                            loadingTask = null;
                            updateList(result, false);
                        }
                        showHelp();
                    }

                    @Override
                    public void onError(JsonNode errors) {
                        synchronized (loadingLock) {
                            Log.d(TAG, "Error loading applications");
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
                        Log.d(TAG, "Application load cancelled");
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

    private void showHelp() {
        if (toolTipHelper != null) return;
        if(getSharedPreferences("Helper", MODE_PRIVATE).getBoolean("JobActivity", false)) return;

        ArrayList<ToolTipHelper.ToolTipInfo> data = new ArrayList<>();
        data.add(ToolTipHelper.makeInfo("This is the profile of a job seeker who is looking for a job like yours.", mCardContainer, Tooltip.Gravity.BOTTOM));
        data.add(ToolTipHelper.makeInfo("You can click on a card to view a their 30 second pitch video and see a limited profile.", mCardContainer, Tooltip.Gravity.BOTTOM));
        data.add(ToolTipHelper.makeInfo("You can swipe left to connect with this job seeker. They will receive a notification of your interest and be able to respond.", mCardContainer, Tooltip.Gravity.BOTTOM));
        data.add(ToolTipHelper.makeInfo("You can also connect using this button.", findViewById(R.id.positive_button), Tooltip.Gravity.TOP));
        data.add(ToolTipHelper.makeInfo("Connecting with a job seeker costs on credit.", findViewById(R.id.tokensLabel), Tooltip.Gravity.TOP));
        data.add(ToolTipHelper.makeInfo("You can swipe right to temporarily dismiss a job seeker.", mCardContainer, Tooltip.Gravity.BOTTOM));
        data.add(ToolTipHelper.makeInfo("This button will permanently dismiss this job seeker, and they will not reappear for this job.", findViewById(R.id.negative_button), Tooltip.Gravity.TOP));

        toolTipHelper = new ToolTipHelper(this, data, new ToolTipHelper.Callback() {
            @Override
            public void onTooltipEnd() {
                getSharedPreferences("Helper", MODE_PRIVATE)
                        .edit()
                        .putBoolean("JobActivity", true)
                        .commit();
            }
        });
    }

    private void update() {
        boolean notEmpty = adapter.getCount() > 0;
        if (mode.equals(CONNECTIONS) || mode.equals(MYSHORTLIST)) {
            mPositiveButtonText.setText(getString(R.string.messages));
            mPositiveButtonIcon.setImageDrawable(getResources().getDrawable(R.drawable.ic_email_blue));
            mShortlistButtonContainer.setVisibility(mode.equals(CONNECTIONS) ? View.VISIBLE : View.INVISIBLE);
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
                mButtons.setVisibility(View.VISIBLE);
            } else {
                mEmptyView.setVisibility(View.VISIBLE);
                mCards.setVisibility(View.INVISIBLE);
                mButtons.setVisibility(View.INVISIBLE);
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
        switch (item.getItemId()) {
            case android.R.id.home:
                finish();
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
