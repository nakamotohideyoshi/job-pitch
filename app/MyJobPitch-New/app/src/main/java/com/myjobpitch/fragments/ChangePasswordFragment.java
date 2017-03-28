package com.myjobpitch.fragments;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ChangePasswordFragment extends BaseFragment {

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
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"old_password", mCurrPasswordView},
                {"new_password1", mPasswordView1},
                {"new_password2", mPasswordView2}
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

        AppHelper.showLoading("Updating...");
        new AsyncTask<Void, Void, MJPApiException>() {
            @Override
            protected MJPApiException doInBackground(Void... params) {
                try {
                    MJPApi.shared().changePassword(password1, password2);
                    return null;
                } catch (MJPApiException e) {
                    return e;
                }
            }
            @Override
            protected void onPostExecute(final MJPApiException e) {
                if (e == null) {
                    AppHelper.hideLoading();
                    getApp().saveLoginInfo(getApp().getEmail(), password1, getApp().getRemember());
                    Popup.showGreen("Success!", "OK", null, null, null, true);
                } else {
                    handleErrors(e);
                }
            }
        }.execute();

    }

}
