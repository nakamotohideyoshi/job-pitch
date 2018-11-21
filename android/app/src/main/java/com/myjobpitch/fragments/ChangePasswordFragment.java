package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.ChangePassword;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.views.Popup;

import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ChangePasswordFragment extends FormFragment {

    @BindView(R.id.user_email)
    TextView mEmailView;

    @BindView(R.id.new_password)
    EditText mPasswordView1;

    @BindView(R.id.confirm_password)
    EditText mPasswordView2;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_change_password, container, false);
        ButterKnife.bind(this, view);

        mEmailView.setText("Email: " + getApp().loadData(AppData.KEY_EMAIL));

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("new_password1", mPasswordView1);
                put("new_password2", mPasswordView2);
            }
        };
    };

    @OnClick(R.id.change_password)
    void onChangePassword() {
        if (!valid()) return;

        final String password1 = mPasswordView1.getText().toString();
        final String password2 = mPasswordView2.getText().toString();

        showLoading();
        new APITask(new APIAction() {
            @Override
            public void run()  {
                ChangePassword changepassword = new ChangePassword(password1, password2);
                MJPApi.shared().changePassword(changepassword);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                new Popup(getContext())
                        .setMessage("Success!")
                        .addGreenButton("Ok", null)
                        .show();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();

    }

}
