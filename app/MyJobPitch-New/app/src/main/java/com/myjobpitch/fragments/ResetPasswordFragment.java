package com.myjobpitch.fragments;

import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.utils.AppHelper;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class ResetPasswordFragment extends BaseFragment {

    @BindView(R.id.user_email)
    EditText mEmailView;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_reset_password, container, false);
        ButterKnife.bind(this, view);

        mEmailView.setText(getApp().getEmail());

        return  view;
    }

    @Override
    protected Object[][] getRequiredFields() {
        return new Object[][] {
                {"email", mEmailView}
        };
    };

    @OnClick(R.id.reset_password)
    void onResetPassword() {
        if (!valid()) return;

        final String email = mEmailView.getText().toString().trim();

        AppHelper.showLoading(null);

        new AsyncTask<Void, Void, Boolean>() {

            @Override
            protected Boolean doInBackground(Void... params) {
                try {
                    MJPApi.shared().resetPassword(email);
                } catch (MJPApiException e) {
                    handleErrors(e);
                    return false;
                }
                return true;
            }

            @Override
            protected void onPostExecute(final Boolean success) {
                if (success) {
                    AppHelper.hideLoading();
                    onCancel();
                }
            }

        }.execute();
    }

    @OnClick(R.id.cancel_button)
    void onCancel() {
        getApp().popFragment();
    }

}
