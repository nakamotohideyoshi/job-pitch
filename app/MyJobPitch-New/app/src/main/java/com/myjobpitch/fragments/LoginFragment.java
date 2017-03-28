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
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LoginFragment extends BaseFragment {

    static boolean isFirst = true;

    @BindView(R.id.user_email)
    EditText mEmailView;

    @BindView(R.id.user_password)
    EditText mPasswordView;

    @BindView(R.id.login_remember)
    CheckBox mRememberView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        ButterKnife.bind(this, view);

        mEmailView.setText(getApp().getEmail());
        if (getApp().getRemember()) {
            mPasswordView.setText(getApp().getPassword());
            mRememberView.setChecked(true);

            if (isFirst) {
                onLogin();
            }
        }

        isFirst = false;

        return  view;
    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"email", mEmailView}, {"password", mPasswordView}
        };
    };

    @OnClick(R.id.forgot_password)
    void onForgotPassword() {
        getApp().pushFragment(new ResetPasswordFragment());
    }

    @OnClick(R.id.go_register)
    void onGoRegister() {
        getApp().replaceFragment(new RegisterFragment());
    }

    @OnClick(R.id.login_button)
    void onLogin() {
        if (!valid()) return;

        final String email = mEmailView.getText().toString();
        final String password = mPasswordView.getText().toString();
        final Boolean remember = mRememberView.isChecked();

        AppHelper.showLoading("Signing in...");

        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... params) {
                try {

                    MJPApi.shared().login(email, password);

                    AppHelper.showLoading("Loading...");

                    AppData.loadData();
                    if (AppData.user.isJobSeeker()) {
                        JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                        AppData.existProfile = jobSeeker.getProfile() != null;
                    }
                    return true;

                } catch (MJPApiException e) {
                    handleErrors(e);
                    return false;
                }

            }

            @Override
            protected void onPostExecute(final Boolean success) {
                if (success) {

                    getApp().saveLoginInfo(email, password, remember);

                    AppHelper.hideLoading();

                    User user = AppData.user;

                    if (user.isRecruiter()) {
                        getApp().loggedin(AppData.PAGE_FIND_TALENT);
                    } else if (user.isJobSeeker()) {
                        if (AppData.existProfile) {
                            getApp().loggedin(AppData.PAGE_FIND_JOB);
                        } else {
                            getApp().loggedin(AppData.PAGE_JOB_PROFILE);
                        }
                    } else {
                        switch (getApp().getUserType()) {
                            case AppData.JOBSEEKER:
                                getApp().loggedin(AppData.PAGE_USER_PROFILE);
                                break;
                            case AppData.RECRUITER:
                                getApp().loggedin(AppData.PAGE_ADD_JOB);
                                break;
                            default:
                                Popup popup = Popup.showYellow("Choose User Type", "Get a Job", new View.OnClickListener() {
                                    @Override
                                    public void onClick(View view) {
                                        getApp().saveUserType(AppData.JOBSEEKER);
                                        getApp().loggedin(AppData.PAGE_USER_PROFILE);
                                    }
                                }, "I Need Staff", new View.OnClickListener() {
                                    @Override
                                    public void onClick(View view) {
                                        getApp().saveUserType(AppData.RECRUITER);
                                        getApp().loggedin(AppData.PAGE_ADD_JOB);
                                    }
                                }, false);
                                popup.button2.setBackgroundResource(R.drawable.button_green);
                                break;
                        }
                    }
                }
            }

        }.execute();

    }

}
