package com.myjobpitch.fragments;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
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

import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.github.rubensousa.bottomsheetbuilder.adapter.BottomSheetItemClickListener;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.utils.Popup;

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

    @BindView(R.id.select_server1)
    Button mSelectServer1;
    @BindView(R.id.select_server2)
    Button mSelectServer2;

    private enum Status {
        LOGIN, REGISTER, RESET
    };
    private Status status = Status.LOGIN;

    private boolean isAnimation = false;
    private static boolean isFirst = true;

    private boolean isPause = false;
    private boolean loggedin = false;


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        ButterKnife.bind(this, view);

        DisplayMetrics displayMetrics = new DisplayMetrics();
        getApp().getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);

        int h = displayMetrics.heightPixels - AppHelper.dp2px(25);
        headerView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int)(h*0.4)));
        bodyView.setLayoutParams(new LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, (int)(h*0.6)));
        registerPanel.setX(displayMetrics.widthPixels);
        resetContainer.setX(displayMetrics.widthPixels);

        String apiUrl = getApp().getSharedPreferences("LoginPreferences", getApp().MODE_PRIVATE)
                .getString("api", null);
        if (apiUrl != null) {
            if (MJPApi.instance == null) {
                MJPApi.apiUrl = apiUrl;
            }
            mSelectServer1.setText(apiUrl);
            mSelectServer2.setText(apiUrl);
        }

        if (AppData.PRODUCT_VERSION) {
            ((ViewGroup)mSelectServer1.getParent()).removeView(mSelectServer1);
            ((ViewGroup)mSelectServer2.getParent()).removeView(mSelectServer2);
        }

        mUserEmailView.setText(getApp().getEmail());
        if (getApp().getRemember()) {
            mUserPassView.setText(getApp().getPassword());
            mRememberView.setChecked(true);

            if (isFirst) {
                onLogin();
            }
        }

        isFirst = false;
        loggedin = false;

        return  view;
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        if (status != Status.RESET) {
            return new HashMap<String, EditText>() {
                {
                    put("email", mUserEmailView);
                    put("password", mUserPassView);
                }
            };
        }

        return new HashMap<String, EditText>() {
            {
                put("email", mResetEmailView);
            }
        };
    }

    private void login() {

        final String email = mUserEmailView.getText().toString();
        final String password = mUserPassView.getText().toString();
        final Boolean remember = mRememberView.isChecked();

        String message = status == Status.LOGIN ? "Signing in..." : "Signing up...";

        new APITask(message, this) {
            @Override
            protected void runAPI() throws MJPApiException {
                if (status == LoginFragment.Status.LOGIN) {
                    MJPApi.shared().login(email, password);
                } else {
                    MJPApi.shared().register(email, password, password);
                }

                AppData.loadData();

                if (AppData.user.isJobSeeker()) {
                    JobSeeker jobSeeker = MJPApi.shared().get(JobSeeker.class, AppData.user.getJob_seeker());
                    AppData.existProfile = jobSeeker.getProfile() != null;
                }
            }

            @Override
            protected void onSuccess() {
                getApp().saveLoginInfo(email, password, remember);

                if (!isPause) {
                    goMain();
                } else {
                    loggedin = true;
                }
            }
        };

    }

    void goMain() {
        User user = AppData.user;

        if (user.isRecruiter()) {
            getApp().loggedin(AppData.PAGE_FIND_TALENT);
            return;
        }

        if (user.isJobSeeker()) {
            if (AppData.existProfile) {
                getApp().loggedin(AppData.PAGE_FIND_JOB);
            } else {
                getApp().loggedin(AppData.PAGE_JOB_PROFILE);
            }
            return;
        }

        switch (getApp().getUserType()) {
            case AppData.JOBSEEKER:
                getApp().loggedin(AppData.PAGE_USER_PROFILE);
                break;
            case AppData.RECRUITER:
                getApp().loggedin(AppData.PAGE_ADD_JOB);
                break;
            default:
                Popup.showGreenYellow("Choose User Type", "Get a Job", new View.OnClickListener() {
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
                break;
        }
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
            getApp().saveUserType(AppData.JOBSEEKER);
            login();
        }
    }

    @OnClick(R.id.register_button2)
    void onRegister2() {
        if (valid()) {
            getApp().saveUserType(AppData.RECRUITER);
            login();
        }
    }

    @OnClick(R.id.reset_button)
    void onResetPassword() {
        if (valid()) {

            final String email = mResetEmailView.getText().toString().trim();

            new APITask("", this) {
                @Override
                protected void runAPI() throws MJPApiException {
                    MJPApi.shared().resetPassword(email);
                }
                @Override
                protected void onSuccess() {
                    onResetCancel();
                }
            };

        }
    }

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
        movingView(resetContainer, loginContainer, 1);
    }

    @OnClick(R.id.select_server1)
    void onSelectServer1() {
        onSelectServer2();
    }

    @OnClick(R.id.select_server2)
    void onSelectServer2() {
        new BottomSheetBuilder(getApp())
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addTitleItem("Select")
                .addItem(0, "https://www.myjobpitch.com/", R.drawable.ic_send)
                .addItem(1, "https://www.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(2, "https://test.sclabs.co.uk/", R.drawable.ic_send)
                .expandOnStart(true)
                .setItemClickListener(new BottomSheetItemClickListener() {
                    @Override
                    public void onBottomSheetItemClick(MenuItem item) {
                        MJPApi.apiUrl = item.getTitle().toString();
                        MJPApi.instance = null;
                        mSelectServer1.setText(MJPApi.apiUrl);
                        mSelectServer2.setText(MJPApi.apiUrl);
                        getApp().getSharedPreferences("LoginPreferences", getApp().MODE_PRIVATE).edit()
                                .putString("api", MJPApi.apiUrl)
                                .apply();
                    }
                })
                .createDialog()
                .show();
    }

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

    @Override
    public void onResume() {
        super.onResume();
        isPause = false;
        if (loggedin) {
            goMain();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        isPause = true;
    }

}
