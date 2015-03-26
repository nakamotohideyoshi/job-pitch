package com.myjobpitch.activities;

import android.content.Context;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.SimpleAdapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.ReadAPITask;
import com.myjobpitch.tasks.ReadBusinessesTask;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class BusinessListActivity extends MJPProgressActionBarActivity {

    private ListView list;

    class BusinessListAdapter extends ArrayAdapter<Business> {
        public BusinessListAdapter(List<Business> list) {
            super(BusinessListActivity.this, android.R.layout.simple_list_item_1, list);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_business_list);
        list = (ListView)findViewById(R.id.business_list);
        ReadBusinessesTask readBusinesses = new ReadBusinessesTask(getApi());
        readBusinesses.addListener(new ReadAPITask.Listener<List<Business>>() {
            @Override
            public void onSuccess(List<Business> result) {
                Log.d("BusinessListActivity", "success");
                list.setAdapter(new BusinessListAdapter(result));
                showProgress(false);
            }

            @Override
            public void onError(JsonNode errors) {
                // TODO
            }

            @Override
            public void onCancelled() {}
        });
        readBusinesses.execute();
        Log.d("RecruiterActivity", "created");
    }

    @Override
    protected View getProgressView() {
        return findViewById(R.id.progress);
    }

    @Override
    protected View getMainView() {
        return findViewById(R.id.business_list_container);
    }

    @Override
    public void onBackPressed() {
        Log.d("RecruiterActivity", "back");
        super.onBackPressed();
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
