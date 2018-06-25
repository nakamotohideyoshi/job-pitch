package com.myjobpitch.fragments;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
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
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.Deprecation;
import com.myjobpitch.api.data.Message;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.utils.AppHelper;
import com.myjobpitch.views.Popup;

import java.util.ArrayList;
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
    private boolean showIntro = true;

    public String versionName = "0.0.0";
    public int versionCode = 0;

    public Boolean depreactionError = false;

    public List<Deprecation>  deprecations;

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

        if (AppData.PRODUCTION) {
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

        if (MJPApi.instance == null && !depreactionError) {

            checkDeprecation(view);
        }

        isLoggedin = false;

        return view;
    }

    public void isLogin(View view) {
        // check auto login

        if (mRememberView.isChecked() && !depreactionError) {
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

    }

    private  void checkDeprecation(final View view) {
        showLoading(view);
        try {
            PackageInfo packageInfo = getActivity().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            versionName = packageInfo.versionName.replace("-beta", "");
            versionCode = packageInfo.versionCode;

            new APITask(new APIAction() {
                @Override
                public void run() throws MJPApiException {
                    String query = null;
                    deprecations  = MJPApi.shared().loadDeprecations();

                }
            }).addListener(new APITaskListener() {
                @Override
                public void onSuccess() {
                    hideLoading();
                    for (int i=0; i<deprecations.size(); i++) {
                        if (deprecations.get(i).getPlatform().equals("ANDROID")) {
                            if (versionCompare(versionName, deprecations.get(i).getError()) <= 0) {
                                depreactionError = true;
                                showDeprecationError();
                            } else if (versionCompare(versionName, deprecations.get(i).getWarning()) <= 0) {
                                depreactionError = false;
                                showDeprecationWarning();
                            } else {
                                depreactionError = false;
                                isLogin(view);
                            }
                        }
                    }
                }

                @Override
                public void onError(JsonNode errors) {
                    errorHandler(errors);
                }
            }).execute();
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
    }

    public void showDeprecationError() {
        Popup popup = new Popup(getContext(), "Your app is out of date, you must upgrade to continue", true);
        popup.addGreenButton("Update", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                goToGooglePlayStore();
            }
        });
        popup.addGreyButton("Close app", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                android.os.Process.killProcess(android.os.Process.myPid());
            }
        });
        popup.show();
    }


    public void showDeprecationWarning() {
        Popup popup = new Popup(getContext(), "Your app is out of date, update now to take advantage of teh latest features", true);
        popup.addGreenButton("Update", new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                goToGooglePlayStore();
            }
        });
        popup.addGreyButton("Dismiss", new View.OnClickListener() {
            @Override
            public void onClick(View v) {

            }
        });
        popup.show();
    }

    public void goToGooglePlayStore() {

        final String appPackageName = getContext().getPackageName(); // getPackageName() from Context or Activity object
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackageName)));
        } catch (android.content.ActivityNotFoundException e) {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appPackageName)));
        }

    }

    public static int versionCompare(String str1, String str2) {
        String[] values1 = str1.split("\\.");
        String[] values2 = str2.split("\\.");
        int i = 0;
        // set index to first non-equal ordinal or length of shortest version string
        while (i < values1.length && i < values2.length && values1[i].equals(values2[i])) {
            i++;
        }
        // compare first non-equal ordinal number
        if (i < values1.length && i < values2.length) {
            int diff = Integer.valueOf(values1[i]).compareTo(Integer.valueOf(values2[i]));
            return Integer.signum(diff);
        }
        // the strings are equal or one string is a substring of the other
        // e.g. "1.2.3" = "1.2.3" or "1.2.3" < "1.2.3.4"
        return Integer.signum(values1.length - values2.length);
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
        showIntro = false;
        isLoggedin = true;
        Intent intent = new Intent(getApp(), IntroActivity.class);
        startActivity(intent);
    }

    void goMain() {
        User user = AppData.user;

        getApp().startNewMessageCount();

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
                if (showIntro) {
                    showIntro();
                } else {
                    showMainPage(AppData.PAGE_VIEW_PROFILE);
                }
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
                        if (showIntro) {
                            showIntro();
                        } else {
                            showMainPage(AppData.PAGE_VIEW_PROFILE);
                        }
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
        if (depreactionError) {
            showDeprecationError();
        } else {
            if (valid()) {
                login();
            }
        }

    }

    @OnClick(R.id.register_button1)
    void onRegister1() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            if (valid()) {
                AppData.saveUserType(AppData.JOBSEEKER);
                login();
            }
        }
    }

    @OnClick(R.id.register_button2)
    void onRegister2() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            if (valid()) {
                AppData.saveUserType(AppData.RECRUITER);
                login();
            }
        }
    }

    @OnClick(R.id.reset_button)
    void onResetPassword() {
        if (depreactionError) {
            showDeprecationError();
        } else {
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
    }

    /* navigation */

    @OnClick(R.id.go_register)
    void onShowRegister() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            status = Status.REGISTER;
            movingView(loginPanel, registerPanel, -1);
        }
    }

    @OnClick(R.id.go_login)
    void onShowLogin() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            status = Status.LOGIN;
            movingView(registerPanel, loginPanel, 1);
        }
    }

    @OnClick(R.id.forgot_password)
    void onShowReset() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            status = Status.RESET;
            mResetEmailView.setText(mUserEmailView.getText());
            movingView(loginContainer, resetContainer, -1);
        }
    }

    @OnClick(R.id.reset_cancel)
    void onResetCancel() {
        if (depreactionError) {
            showDeprecationError();
        } else {
            status = Status.LOGIN;
            mUserEmailView.setText(mResetEmailView.getText());
            movingView(resetContainer, loginContainer, 1);
        }
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
