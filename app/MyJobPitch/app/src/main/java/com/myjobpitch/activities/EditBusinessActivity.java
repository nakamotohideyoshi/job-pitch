package com.myjobpitch.activities;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.NavUtils;
import android.util.Log;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.fragments.BusinessEditFragment;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.tasks.CreateReadUpdateAPITaskListener;
import com.myjobpitch.tasks.UploadImage;
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
        mBusinessEditFragment = (BusinessEditFragment) getSupportFragmentManager().findFragmentById(R.id.business_edit_fragment);
        mProgressView = findViewById(R.id.progress);

        Button saveButton = (Button) findViewById(R.id.save_button);
        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                attemptSave();
            }
        });

        if (savedInstanceState != null) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                String business_data = savedInstanceState.getString("business_data");
                Log.d("EditBusinessActivity", String.format("savedIntanceState['business_data']: %s", business_data));
                business = mapper.readValue(business_data, Business.class);
                mBusinessEditFragment.load(business);
                showProgress(false);
            } catch (IOException e) {
                Log.e("EditBusinessActivity", "Error", e);
            }
        } else if (getIntent().hasExtra("business_data")) {
            ObjectMapper mapper = new ObjectMapper();
            try {
                business = mapper.readValue(getIntent().getStringExtra("business_data"), Business.class);
                mBusinessEditFragment.load(business);
                showProgress(false);
            } catch (IOException e) {
            }
        } else if (getIntent().hasExtra("business_id")) {
            int business_id = getIntent().getIntExtra("business_id", -1);
            mReadBusinessTask = new ReadUserBusinessTask(getApi(), business_id);
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
            setTitle(R.string.action_add_business);
            business = new Business();
            mBusinessEditFragment.load(business);
            showProgress(false);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        mBusinessEditFragment.save(business);
        ObjectMapper mapper = new ObjectMapper();
        try {
            outState.putString("business_data", mapper.writeValueAsString(business));
        } catch (JsonProcessingException e) {}
    }

    private void attemptSave() {
        if (mBusinessEditFragment.validateInput()) {
            showProgress(true);

            mBusinessEditFragment.save(business);

            final MJPApi api = ((MJPApplication) getApplication()).getApi();
            mCreateUpdateBusinessTask = new CreateUpdateBusinessTask(api, business);
            mCreateUpdateBusinessTask.addListener(new CreateReadUpdateAPITaskListener<Business>() {
                @Override
                public void onSuccess(final Business business) {
                    final Uri imageUri = mBusinessEditFragment.getNewImageUri();
                    if (imageUri == null) {
                        returnToListActivity(business);
                    } else {
                        UploadImage uploadTask = new UploadImage(EditBusinessActivity.this, getApi(), "user-business-images", "business", imageUri, business);
                        uploadTask.addListener(new APITaskListener() {
                            @Override
                            public void onPostExecute() {
                                returnToListActivity(business);
                            }

                            @Override
                            public void onCancelled() {
                                showProgress(false);
                                Toast toast = Toast.makeText(EditBusinessActivity.this, "Error uploading company logo", Toast.LENGTH_LONG);
                                toast.show();
                            }
                        });
                        uploadTask.execute();
                    }
                }

                @Override
                public void onError(JsonNode errors) {
                    showProgress(false);
                    Toast toast = Toast.makeText(EditBusinessActivity.this, "Error updating company details", Toast.LENGTH_LONG);
                    toast.show();
                }

                @Override
                public void onCancelled() {
                    showProgress(false);
                }
            });
            mCreateUpdateBusinessTask.execute();
        }
    }

    private void returnToListActivity(Business business) {
        Intent intent = new Intent(this, LocationListActivity.class);
        intent.putExtra("business_id", business.getId());
        startActivity(intent);
        EditBusinessActivity.this.finish();
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        Intent intent;
        switch (item.getItemId()) {
            case android.R.id.home:
                intent = NavUtils.getParentActivityIntent(EditBusinessActivity.this);
                startActivity(intent);
                finish();
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
        return mEditBusinessView;
    }

}
