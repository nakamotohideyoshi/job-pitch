package com.myjobpitch.activities;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.annotation.TargetApi;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MjpApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.fragments.BusinessEditFragment;
import com.myjobpitch.tasks.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadBusinessTask;

import java.io.IOException;

public class EditBusinessActivity extends MJPActionBarActivity implements BusinessEditFragment.BusinessEditHost {

    private BusinessEditFragment mBusinessEditFragment;
    private View mEditBusinessView;
    private Business business;
    private View mProgressView;
    private ReadBusinessTask mReadBusinessTask;
    private CreateUpdateBusinessTask mCreateUpdateBusinessTask;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_business);

        mEditBusinessView = (View) findViewById(R.id.business_edit);
        mBusinessEditFragment = (BusinessEditFragment) getFragmentManager().findFragmentById(R.id.business_edit_fragment);
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        if (getIntent().hasExtra("business_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                business = mapper.readValue(getIntent().getStringExtra("business_data"), Business.class);
                mBusinessEditFragment.load(business);
                showProgress(false);
            } catch (IOException e) {}
        } else if (getIntent().hasExtra("business_id")) {
            mReadBusinessTask = new ReadBusinessTask(getApi(), getIntent().getIntExtra("business_id", -1));
            mReadBusinessTask.addListener(new ReadAPITask.Listener<Business>() {
                @Override
                public void onSuccess(Business result) {
                    business = result;
                    mBusinessEditFragment.load(business);
                    showProgress(false);
                }

                @Override
                public void onError(JsonNode errors) {
                    finish();
                    Toast toast = Toast.makeText(EditBusinessActivity.this, "Error loading business", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                }
            });
            mReadBusinessTask.execute();
        } else {
            showProgress(false);
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        showProgress(false);
        finish();
    }

    private void attemptSave() {
        if (mBusinessEditFragment.validateInput()) {
            showProgress(true);

            if (business == null)
                business = new Business();
            mBusinessEditFragment.save(business);

            final MJPApi api = ((MjpApplication) getApplication()).getApi();
            mCreateUpdateBusinessTask = new CreateUpdateBusinessTask(api, business);
            mCreateUpdateBusinessTask.addListener(new CreateUpdateBusinessTask.Listener() {
                @Override
                public void onSuccess(Business business) {
                    EditBusinessActivity.this.finish();
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateBusinessTask.execute();
        }
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB_MR2)
    public void showProgress(final boolean show) {
        // On Honeycomb MR2 we have the ViewPropertyAnimator APIs, which allow
        // for very easy animations. If available, use these APIs to fade-in
        // the progress spinner.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.HONEYCOMB_MR2) {
            int shortAnimTime = getResources().getInteger(android.R.integer.config_shortAnimTime);

            mEditBusinessView.setVisibility(show ? View.GONE : View.VISIBLE);
            mEditBusinessView.animate().setDuration(shortAnimTime).alpha(
                    show ? 0 : 1).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mEditBusinessView.setVisibility(show ? View.GONE : View.VISIBLE);
                }
            });

            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mProgressView.animate().setDuration(shortAnimTime).alpha(
                    show ? 1 : 0).setListener(new AnimatorListenerAdapter() {
                @Override
                public void onAnimationEnd(Animator animation) {
                    mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
                }
            });
        } else {
            // The ViewPropertyAnimator APIs are not available, so simply show
            // and hide the relevant UI components.
            mProgressView.setVisibility(show ? View.VISIBLE : View.GONE);
            mEditBusinessView.setVisibility(show ? View.GONE : View.VISIBLE);
        }
    }
}
