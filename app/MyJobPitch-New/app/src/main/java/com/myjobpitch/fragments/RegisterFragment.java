package com.myjobpitch.fragments;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.CheckBox;
import android.widget.EditText;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class RegisterFragment extends BaseFragment {

    @BindView(R.id.user_email)
    EditText mEmailView;

    @BindView(R.id.user_password)
    EditText mPasswordView;

    @BindView(R.id.login_remember)
    CheckBox mRememberView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_register, container, false);
        ButterKnife.bind(this, view);
        return  view;
    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"email", mEmailView}, {"password", mPasswordView}
        };
    };

    @OnClick(R.id.register_button1)
    void onRegister1() {
        register(AppData.JOBSEEKER);
    }

    @OnClick(R.id.register_button2)
    void onRegister2() {
        register(AppData.RECRUITER);
    }

    @OnClick(R.id.go_login)
    void onGoLogin() {
        getApp().replaceFragment(new LoginFragment());
    }

    void register(final int userType) {

        if (!valid()) return;

        getApp().saveUserType(userType);

        final String email = mEmailView.getText().toString();
        final String password = mPasswordView.getText().toString();
        final Boolean remember = mRememberView.isChecked();

        AppHelper.showLoading("Signing up...");

        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... params) {
                try {

                    MJPApi.shared().register(email, password, password);

                    AppHelper.showLoading("Loading...");
                    AppData.loadData();

                    return true;

                } catch (MJPApiException e) {
                    handleErrors(e);
                    return false;
                }
            }

            @Override
            protected void onPostExecute(final Boolean success) {
                if (success) {
                    AppHelper.hideLoading();

                    getApp().saveLoginInfo(email, password, remember);

                    if (userType == AppData.JOBSEEKER) {
                        getApp().loggedin(AppData.PAGE_USER_PROFILE);
                    } else {
                        getApp().loggedin(AppData.PAGE_ADD_JOB);
                    }
                }
            }

        }.execute();

    }

}
