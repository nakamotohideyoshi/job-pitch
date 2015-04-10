package com.myjobpitch.fragments;

import android.app.Fragment;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.CreateUpdateBusinessTask;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;


/**
 * A simple {@link android.app.Fragment} subclass.
 * Activities that contain this fragment must implement the
 * {@link BusinessEditFragment.BusinessEditHost} interface
 * to handle interaction events.
 * Use the {@link BusinessEditFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class BusinessEditFragment extends Fragment implements CreateUpdateBusinessTask.Listener<Business> {

    private EditText mNameView;
    private List<TextView> requiredFields;
    private Map<String, TextView> fields;

    /**
     * Use this factory method to create a new instance of
     * this fragment using the provided parameters.
     *
     * @return A new instance of fragment RecruiterProfileFragment.
     */
    public static BusinessEditFragment newInstance() {
        BusinessEditFragment fragment = new BusinessEditFragment();
        Bundle args = new Bundle();
//        args.putString(ARG_PARAM1, param1);
//        args.putString(ARG_PARAM2, param2);
        fragment.setArguments(args);
        return fragment;
    }

    public BusinessEditFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
//            mParam1 = getArguments().getString(ARG_PARAM1);
//            mParam2 = getArguments().getString(ARG_PARAM2);
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_business_edit, container, false);

        mNameView = (EditText) view.findViewById(R.id.business_name);

        requiredFields = new ArrayList<>();
        requiredFields.add(mNameView);

        fields = new HashMap<>();
        fields.put("name", mNameView);

        return view;
    }

    public boolean validateInput() {
        for (TextView field : fields.values())
            field.setError(null);

        View errorField = null;
        for (TextView field : requiredFields) {
            if (TextUtils.isEmpty(field.getText())) {
                field.setError(getString(R.string.error_field_required));
                if (errorField == null)
                    errorField = field;
            }
        }

        if (errorField != null) {
            errorField.requestFocus();
            return false;
        }
        return true;
    }

    public void load(Business business) {
        mNameView.setText(business.getName());
    }

    public void save(Business business) {
        business.setName(mNameView.getText().toString());
    }

    public CreateUpdateBusinessTask getCreateBusinessTask(MJPApi api, Business business) {
        CreateUpdateBusinessTask task = new CreateUpdateBusinessTask(api, business);
        task.addListener(this);
        return task;
    }

    @Override
    public void onSuccess(Business business) {

    }

    @Override
    public void onError(JsonNode errors) {
        Iterator<Map.Entry<String, JsonNode>> error_data = errors.fields();
        while (error_data.hasNext()) {
            Map.Entry<String, JsonNode> error = error_data.next();
            if (fields.containsKey(error.getKey()))
                fields.get(error.getKey()).setError(error.getValue().textValue());
        }
    }

    @Override
    public void onCancelled() {

    }

    public interface BusinessEditHost {

    }

}
