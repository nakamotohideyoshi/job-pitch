package com.myjobpitch.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.Popup;

import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ChangePasswordFragment extends FormFragment {

    @BindView(R.id.user_email)
    TextView mEmailView;

    @BindView(R.id.old_password)
    EditText mCurrPasswordView;

    @BindView(R.id.new_password)
    EditText mPasswordView1;

    @BindView(R.id.confirm_password)
    EditText mPasswordView2;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_change_password, container, false);
        ButterKnife.bind(this, view);

        mEmailView.setText("Email: " + getApp().getEmail());

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("old_password", mCurrPasswordView);
                put("new_password1", mPasswordView1);
                put("new_password2", mPasswordView2);
            }
        };
    };

    @OnClick(R.id.change_password)
    void onChangePassword() {
        if (!valid()) return;

        if (!mCurrPasswordView.getText().toString().equals(getApp().getPassword())) {
            mCurrPasswordView.setError("Your old password was incorrect.");
            return;
        }

        final String password1 = mPasswordView1.getText().toString();
        final String password2 = mPasswordView2.getText().toString();

        new APITask("Updating...", this) {
            @Override
            protected void runAPI() throws MJPApiException {
                MJPApi.shared().changePassword(password1, password2);
            }
            @Override
            protected void onSuccess() {
                getApp().saveLoginInfo(getApp().getEmail(), password1, getApp().getRemember());
                Popup.showMessage("Success!", null);
            }
        };

    }

}
