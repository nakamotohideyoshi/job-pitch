package com.myjobpitch.activities;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.fragments.BusinessEditFragment;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.recruiter.CreateUpdateBusinessTask;
import com.myjobpitch.tasks.recruiter.ReadUserBusinessTask;

import java.io.IOException;

public class EditBusinessActivity extends MJPProgressActionBarActivity {

    private BusinessEditFragment mBusinessEditFragment;
    private View mEditBusinessView;
    private Business business;
    private View mProgressView;
    private ReadUserBusinessTask mReadBusinessTask;
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
            mReadBusinessTask = new ReadUserBusinessTask(getApi(), getIntent().getIntExtra("business_id", -1));
            mReadBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
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
        if (business == null)
            setTitle(R.string.action_add_business);
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

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateBusinessTask = new CreateUpdateBusinessTask(api, business);
            mCreateUpdateBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
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

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mEditBusinessView;
    }
}
