package com.myjobpitch.fragments;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.github.rubensousa.bottomsheetbuilder.adapter.BottomSheetItemClickListener;
import com.myjobpitch.IntroActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.HashMap;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LoginFragment extends FormFragment {

    @BindView(R.id.login_header)
    View headerView;
    @BindView(R.id.login_body)
    View bodyView;

    @BindView(R.id.login_panel)
    View loginPanel;
    @BindView(R.id.register_panel)
    View registerPanel;

    @BindView(R.id.login_container)
    View loginContainer;
    @BindView(R.id.reset_container)
    View resetContainer;

    @BindView(R.id.user_email)
    EditText mUserEmailView;
    @BindView(R.id.user_password)
    EditText mUserPassView;
    @BindView(R.id.login_remember)
    CheckBox mRememberView;

    @BindView(R.id.reset_email)
    EditText mResetEmailView;

    @BindView(R.id.select_server)
    Button mSelectServer;

    private enum Status {
        LOGIN, REGISTER, RESET
    };
    private Status status = Status.LOGIN;

    private boolean isLoggedin = false;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View view = inflater.inflate(R.layout.fragment_login, container, false);
        ButterKnife.bind(this, view);

        // setting ui

        DisplayMetrics displayMetrics = new DisplayMetrics();
        getApp().getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);

        int h = displayMetrics.heightPixels - AppHelper.dp2px(25);
        headerView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int)(h*0.4)));
        bodyView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int)(h*0.6)));
        registerPanel.setX(displayMetrics.widthPixels);
        resetContainer.setX(displayMetrics.widthPixels);

        mUserEmailView.setText(AppData.getEmail());
        mRememberView.setChecked(AppData.getRemember());

        // get server url

        if (AppData.PRODUCT_VERSION) {
            ((ViewGroup)mSelectServer.getParent()).removeView(mSelectServer);
        } else {
            String apiUrl = AppData.getServerUrl();
            if (apiUrl != null) {
                if (MJPApi.instance == null) {
                    MJPApi.apiUrl = apiUrl;
                }
                mSelectServer.setText(apiUrl);
            }
        }

        // check auto login
        if (MJPApi.instance == null && mRememberView.isChecked()) {
            String token = AppData.getToken();
            MJPApi.shared().setToken(token);

            showLoading(view);
            loading.setBackground(R.color.colorPrimary);
            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    AppData.loadData();
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    if (LoginFragment.this.isResumed()) {
                        goMain();
                    } else {
                        isLoggedin = true;
                    }
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        }


        isLoggedin = false;

        return view;
    }


    @Override
    public void onResume() {
        super.onResume();

        if (isLoggedin) {
            goMain();
        }
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return status != Status.RESET ?
                (new HashMap<String, EditText>() {
                    {
                        put("email", mUserEmailView);
                        put("password", mUserPassView);
                    }
                }) :
                (new HashMap<String, EditText>() {
                    {
                        put("email", mResetEmailView);
                    }
                });
    }

    private void login() {
        showLoading();
        loading.setBackground(R.color.colorPrimary);

        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                String email = mUserEmailView.getText().toString().trim();
                String password = mUserPassView.getText().toString();
                Boolean remember = mRememberView.isChecked();

                AuthToken token;
                if (status == LoginFragment.Status.LOGIN) {
                    token = MJPApi.shared().login(email, password);
                } else {
                    token = MJPApi.shared().register(email, password, password);
                }

                AppData.loadData();
                AppData.saveToken(remember ? token.getKey() : "");
                AppData.saveLoginInfo(email, remember);
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                if (LoginFragment.this.isResumed()) {
                    goMain();
                } else {
                    isLoggedin = true;
                }
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void showIntro() {
        Intent intent = new Intent(getApp(), IntroActivity.class);
        startActivityForResult(intent, AppData.REQUEST_INTRO);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
            if (requestCode == AppData.REQUEST_INTRO) {
                showMainPage(AppData.PAGE_VIEW_PROFILE);
            }
        }
    }

    void goMain() {
        User user = AppData.user;

        if (user.isRecruiter()) {
            showMainPage(AppData.PAGE_FIND_TALENT);
            return;
        }

        if (user.isJobSeeker()) {
            if (AppData.existProfile) {
                showMainPage(AppData.PAGE_FIND_JOB);
            } else {
                showMainPage(AppData.PAGE_JOB_PROFILE);
            }
            return;
        }

        switch (AppData.getUserType()) {
            case AppData.JOBSEEKER:
                showIntro();
                break;
            case AppData.RECRUITER:
                showMainPage(AppData.PAGE_ADD_JOB);
                break;
            default:
                Popup popup = new Popup(getContext(), "Choose User Type", false);
                popup.addYellowButton("Get a Job", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        AppData.saveUserType(AppData.JOBSEEKER);
                        showIntro();
                    }
                });
                popup.addGreenButton("I Need Staff", new View.OnClickListener() {
                    @Override
                    public void onClick(View view) {
                        AppData.saveUserType(AppData.RECRUITER);
                        showMainPage(AppData.PAGE_ADD_JOB);
                    }
                });
                popup.show();
                break;
        }

    }

    void showMainPage(int pageID) {
        getApp().reloadMenu();
        getApp().setRootFragement(pageID);
    }

    @OnClick(R.id.login_button)
    void onLogin() {
        if (valid()) {
            login();
        }
    }

    @OnClick(R.id.register_button1)
    void onRegister1() {
        if (valid()) {
            AppData.saveUserType(AppData.JOBSEEKER);
            login();
        }
    }

    @OnClick(R.id.register_button2)
    void onRegister2() {
        if (valid()) {
            AppData.saveUserType(AppData.RECRUITER);
            login();
        }
    }

    @OnClick(R.id.reset_button)
    void onResetPassword() {
        if (valid()) {
            showLoading();
            loading.setBackground(R.color.colorPrimary);

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    String email = mResetEmailView.getText().toString().trim();
                    MJPApi.shared().resetPassword(email);
                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    hideLoading();
                    Popup popup = new Popup(getContext(), "Password reset requested, please check your email.", true);
                    popup.addGreyButton("OK", new View.OnClickListener() {
                        @Override
                        public void onClick(View view) {
                            onResetCancel();
                        }
                    });
                    popup.show();
                }
                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        }
    }

    /* navigation */

    @OnClick(R.id.go_register)
    void onShowRegister() {
        status = Status.REGISTER;
        movingView(loginPanel, registerPanel, -1);
    }

    @OnClick(R.id.go_login)
    void onShowLogin() {
        status = Status.LOGIN;
        movingView(registerPanel, loginPanel, 1);
    }

    @OnClick(R.id.forgot_password)
    void onShowReset() {
        status = Status.RESET;
        mResetEmailView.setText(mUserEmailView.getText());
        movingView(loginContainer, resetContainer, -1);
    }

    @OnClick(R.id.reset_cancel)
    void onResetCancel() {
        status = Status.LOGIN;
        mUserEmailView.setText(mResetEmailView.getText());
        movingView(resetContainer, loginContainer, 1);
    }

    private boolean isAnimation = false;

    private void movingView(final View outView, final View inView, final int dir) {
        if (isAnimation) return;

        getApp().hideKeyboard();

        isAnimation = true;

        final float outViewX0 = outView.getX();
        final float inViewX0 = inView.getX();

        DisplayMetrics displayMetrics = new DisplayMetrics();
        getApp().getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);

        ValueAnimator animator = ValueAnimator.ofFloat(0, displayMetrics.widthPixels);
        animator.setDuration(500);
        animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                float value = (float) animation.getAnimatedValue();
                outView.setTranslationX(outViewX0 + value * dir);
                inView.setTranslationX(inViewX0 + value * dir);
            }
        });

        ObjectAnimator animation1 = ObjectAnimator.ofFloat(outView, "alpha", 1, 0);
        animation1.setDuration(300);
        ObjectAnimator animation2 = ObjectAnimator.ofFloat(inView, "alpha", 0, 1);
        animation1.setDuration(300);

        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.play(animator).with(animation1).with(animation2);
        animatorSet.start();
        animatorSet.addListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animation) {
            }
            @Override
            public void onAnimationEnd(Animator animation) {
                isAnimation = false;
            }
            @Override
            public void onAnimationCancel(Animator animation) {
            }
            @Override
            public void onAnimationRepeat(Animator animation) {
            }
        });
    }

    /* loading icon */

    /* select server */

    @OnClick(R.id.select_server)
    void onSelectServer() {
        new BottomSheetBuilder(getApp())
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addTitleItem("Select")
                .addItem(0, "https://app.myjobpitch.com/", R.drawable.ic_send)
                .addItem(1, "https://test.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(2, "https://demo.sclabs.co.uk/", R.drawable.ic_send)
                .expandOnStart(true)
                .setItemClickListener(new BottomSheetItemClickListener() {
                    @Override
                    public void onBottomSheetItemClick(MenuItem item) {
                        String apiUrl = item.getTitle().toString();
                        mSelectServer.setText(apiUrl);
                        AppData.saveServerUrl(apiUrl);
                        MJPApi.apiUrl = apiUrl;
                        MJPApi.instance = null;
                    }
                })
                .createDialog()
                .show();
    }

}
