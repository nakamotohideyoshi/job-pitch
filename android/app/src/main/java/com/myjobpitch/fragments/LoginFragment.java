package com.myjobpitch.fragments;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.LayoutInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.github.rubensousa.bottomsheetbuilder.adapter.BottomSheetItemClickListener;
import com.myjobpitch.activities.IntroActivity;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.Login;
import com.myjobpitch.api.auth.Registration;
import com.myjobpitch.api.auth.ResetPassword;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Deprecation;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.HashMap;
import java.util.List;

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

    @BindView(R.id.reset_email)
    EditText mResetEmailView;

    @BindView(R.id.select_server)
    Button mAPIButton;

    private enum Status {
        LOGIN, REGISTER, RESET
    }

    private Status status = Status.LOGIN;
    private boolean isLoggedin = false;
    private List<Deprecation>  deprecations;

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

        mUserEmailView.setText(AppData.getEmail());

        if (AppData.PRODUCTION) {
            ((ViewGroup)mAPIButton.getParent()).removeView(mAPIButton);
        } else {
            String apiUrl = AppData.getServerUrl();
            if (apiUrl != null) {
                if (MJPApi.instance == null) {
                    MJPApi.apiUrl = apiUrl;
                }
                mAPIButton.setText(apiUrl);
            }
        }

        if (MJPApi.instance == null) {
            if (!MJPApi.shared().isLogin()) {
                checkDeprecation(view);
            } else {
                autoLogin(view);
            }
        } else {
            AppData.saveToken("");
        }

        return view;
    }

    public void autoLogin(View view) {

        String token = AppData.getToken();

        if (!token.isEmpty()) {

            MJPApi.shared().setToken(new AuthToken(token));

            showLoading(view);

            new APITask(new APIAction() {
                @Override
                public void run() {
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
            return;
        }

        MJPApi.shared().clearToken();
        AppData.clearData();
    }

    private  void checkDeprecation(View view) {
        showLoading(view);

        new APITask(new APIAction() {
            @Override
            public void run() {
                deprecations  = MJPApi.shared().loadDeprecations();
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();

                if (deprecations.size() == 0) {
                    autoLogin(null);
                    return;
                }

                int versionCode = 0;
                try {
                    PackageInfo packageInfo = getActivity().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
                    versionCode = packageInfo.versionCode;
                } catch (PackageManager.NameNotFoundException e) {
                    e.printStackTrace();
                }

                for (Deprecation deprecation : deprecations) {
                    if (deprecation.getPlatform().equals("ANDROID")) {
                        if (versionCode < Integer.parseInt(deprecation.getError())) {

                            Popup popup = new Popup(getContext(), "Your app is out of date, you must upgrade to continue", true);
                            popup.addGreenButton("Update", new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    goToGooglePlayStore();
                                    android.os.Process.killProcess(android.os.Process.myPid());
                                }
                            });
                            popup.addGreyButton("Close app", new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {
                                    android.os.Process.killProcess(android.os.Process.myPid());
                                }
                            });
                            popup.show();

                        } else if (versionCode < Integer.parseInt(deprecation.getWarning())) {

                            Popup popup = new Popup(getContext(), "Your app is out of date, update now to take advantage of the latest features", true);
                            popup.addGreenButton("Update", new View.OnClickListener() {
                                @Override
                                public void onClick(View view) {
                                    goToGooglePlayStore();
                                }
                            });
                            popup.addGreyButton("Dismiss", new View.OnClickListener() {
                                @Override
                                public void onClick(View v) {
                                    autoLogin(null);
                                }
                            });
                            popup.show();

                        } else {
                            autoLogin(null);
                        }
                        break;
                    }
                }
            }

            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void goToGooglePlayStore() {
        final String appPackageName = getContext().getPackageName();
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackageName)));
        } catch (android.content.ActivityNotFoundException e) {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appPackageName)));
        }
    }

    private void login() {
        showLoading();

        new APITask(new APIAction() {
            @Override
            public void run() {
                String email = mUserEmailView.getText().toString().trim();
                String password = mUserPassView.getText().toString();

                AuthToken token;
                if (status == LoginFragment.Status.LOGIN) {
                    Login login = new Login(email, password);
                    token = MJPApi.shared().login(login);
                } else {
                    Registration registration = new Registration(email, password, password);
                    token = MJPApi.shared().register(registration);
                }

                AppData.saveEmail(email);
                AppData.saveToken(token.getKey());

                MJPApi.shared().setToken(token);
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

    void goMain() {
        User user = AppData.user;

        if (user.isRecruiter()) {
            getApp().setRootFragement(R.id.menu_find_talent);
            return;
        }

        if (user.isJobSeeker()) {
            if (AppData.profile == null) {
                getApp().setRootFragement(R.id.menu_job_profile);
            } else {
                getApp().setRootFragement(R.id.menu_find_job);
            }
            return;
        }

        Popup popup = new Popup(getContext(), "Choose User Type", false);
        popup.addYellowButton("Get a Job", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AppData.userRole = Role.JOB_SEEKER_ID;
                Intent intent = new Intent(getApp(), IntroActivity.class);
                getActivity().startActivityForResult(intent, 1);
                getApp().setRootFragement(R.id.menu_user_profile);
            }
        });
        popup.addGreenButton("I Need Staff", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AppData.userRole = Role.RECRUITER_ID;
                getApp().setRootFragement(R.id.menu_business);
            }
        });
        popup.show();

    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (resultCode == Activity.RESULT_OK) {
//            getApp().setRootFragement(R.id.menu_user_profile);
        }
    }

    @Override
    protected void showLoading(String label, View view) {
        super.showLoading(label, view);
        loading.setBackground(R.color.colorPrimary);
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

    @Override
    public void onResume() {
        super.onResume();

        if (isLoggedin) {
            goMain();
        }
    }

    @OnClick(R.id.login_button)
    void onLogin() {
        if (valid()) {
            login();
        }
    }

    @OnClick(R.id.register_button)
    void onRegister() {
        if (valid()) {
            login();
        }
    }

    @OnClick(R.id.reset_button)
    void onResetPassword() {
        if (valid()) {
            showLoading();

            new APITask(new APIAction() {
                @Override
                public void run() {
                    ResetPassword resetpassword = new ResetPassword(mResetEmailView.getText().toString().trim());
                    MJPApi.shared().resetPassword(resetpassword);
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

    /* select server */

    @OnClick(R.id.select_server)
    void onSelectServer() {
        new BottomSheetBuilder(getApp())
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addItem(0, "https://app.myjobpitch.com/", R.drawable.ic_send)
                .addItem(1, "https://test.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(2, "https://demo.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(3, "https://release.sclabs.co.uk/", R.drawable.ic_send)
                .expandOnStart(true)
                .setItemClickListener(new BottomSheetItemClickListener() {
                    @Override
                    public void onBottomSheetItemClick(MenuItem item) {
                        String apiUrl = item.getTitle().toString();
                        mAPIButton.setText(apiUrl);
                        MJPApi.instance = null;
                        MJPApi.apiUrl = apiUrl;
                        AppData.saveServerUrl(apiUrl);
                    }
                })
                .createDialog()
                .show();
    }

}
