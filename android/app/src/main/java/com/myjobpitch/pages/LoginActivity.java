package com.myjobpitch.pages;

import android.animation.Animator;
import android.animation.AnimatorSet;
import android.animation.ObjectAnimator;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.EditorInfo;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageView;

import com.fasterxml.jackson.databind.JsonNode;
import com.github.rubensousa.bottomsheetbuilder.BottomSheetBuilder;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.Login;
import com.myjobpitch.api.auth.Registration;
import com.myjobpitch.api.auth.ResetPassword;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Deprecation;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.pages.jobseeker.JobProfileActivity;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.AppData;
import com.myjobpitch.views.Popup;

import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class LoginActivity extends FormActivity {

    @BindView(R.id.login_form)
    View mLoginForm;
    @BindView(R.id.login_email)
    EditText mLoginEmail;
    @BindView(R.id.login_password)
    EditText mLoginPassword;

    @BindView(R.id.register_form)
    View mRegisterForm;
    @BindView(R.id.register_email)
    EditText mRegisterEmail;
    @BindView(R.id.register_password1)
    EditText mRegisterPassword1;
    @BindView(R.id.register_password2)
    EditText mRegisterPassword2;

    @BindView(R.id.reset_form)
    View mResetForm;
    @BindView(R.id.reset_email)
    EditText mResetEmail;

    @BindView(R.id.logo)
    ImageView mLogo;

    @BindView(R.id.server_url)
    Button mServerUrl;

    List<Deprecation> mDeprecations;

    boolean isLoggedin = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        ButterKnife.bind(this);

        DisplayMetrics displayMetrics = new DisplayMetrics();
        getWindowManager().getDefaultDisplay().getMetrics(displayMetrics);
        mLogo.getLayoutParams().height = (int) (displayMetrics.heightPixels * 0.35);
        mLogo.requestLayout();

        mLoginEmail.setText(loadData(AppData.KEY_EMAIL));

        mLoginPassword.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                onLogin();
            }
            return false;
        });

        mRegisterPassword2.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                onRegister();
            }
            return false;
        });

        mResetEmail.setOnEditorActionListener((v, actionId, event) -> {
            if (actionId == EditorInfo.IME_ACTION_DONE) {
                onReset();
            }
            return false;
        });

        if (AppData.PRODUCTION) {
            ((ViewGroup)mServerUrl.getParent()).removeView(mServerUrl);
        } else {
            String serverUrl = loadData(AppData.KEY_SERVER_URL);
            if (serverUrl != null) {
                if (MJPApi.instance == null) {
                    MJPApi.apiUrl = serverUrl;
                }
            }
            mServerUrl.setText(MJPApi.apiUrl);
        }

        if (MJPApi.instance == null) {
            checkDeprecation();
        } else {
            saveData(AppData.KEY_TOKEN, null);
            AppData.clearData();
        }
    }

    void checkDeprecation() {
        showLoading();

        new APITask(() -> mDeprecations  = MJPApi.shared().loadDeprecations()).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();

                int versionCode = 0;
                try {
                    PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
                    versionCode = packageInfo.versionCode;
                } catch (PackageManager.NameNotFoundException e) {
                    e.printStackTrace();
                }

                if (mDeprecations.size() == 0 || versionCode == 0) {
                    checkAutoLogin();
                    return;
                }

                for (Deprecation deprecation : mDeprecations) {
                    if (deprecation.getPlatform().equals("ANDROID")) {
                        if (versionCode < Integer.parseInt(deprecation.getError())) {

                            new AlertDialog.Builder(LoginActivity.this, android.R.style.Theme_Material_Dialog_Alert)
                                    .setMessage(R.string.app_upgrade_title1)
                                    .setPositiveButton(R.string.app_update_button, (dialog, id) -> {
                                        showGooglePlayStore();
                                        android.os.Process.killProcess(android.os.Process.myPid());
                                    })
                                    .setNegativeButton(R.string.app_close_button, (dialog, id) -> android.os.Process.killProcess(android.os.Process.myPid()))
                                    .setCancelable(false)
                                    .create()
                                    .show();

                        } else if (versionCode < Integer.parseInt(deprecation.getWarning())) {

                            new AlertDialog.Builder(LoginActivity.this, android.R.style.Theme_Material_Dialog_Alert)
                                    .setMessage(R.string.app_upgrade_title2)
                                    .setPositiveButton(R.string.app_update_button, (dialog, id) -> showGooglePlayStore())
                                    .setNegativeButton(R.string.app_dismiss_button, (dialog, id) -> checkAutoLogin())
                                    .setCancelable(false)
                                    .create()
                                    .show();

                        } else {
                            checkAutoLogin();
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

    void checkAutoLogin() {

        String token = loadData(AppData.KEY_TOKEN);

        if (token == null) {
            AppData.clearData();
            return;
        }

        MJPApi.shared().setToken(new AuthToken(token));

        showLoading();

        new APITask(() -> AppData.loadData()).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                checkUserType();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void checkUserType() {
        if (!getWindow().getDecorView().getRootView().isShown()) {
            isLoggedin = true;
            return;
        }

        User user = AppData.user;

        if (user.isRecruiter()) {
            AppData.userRole = Role.RECRUITER_ID;
            showMain();
            return;
        }

        if (user.isJobseeker()) {

            AppData.userRole = Role.JOB_SEEKER_ID;

            if (AppData.profile == null) {
                Intent intent = new Intent(this, JobProfileActivity.class);
                startActivity(intent);
                overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                finish();
            } else {
                showMain();
            }
            return;
        }

        loading.showLoading(false);

        Popup popup = new Popup(this)
                .setMessage(R.string.choose_user_type)
                .addGreenButton(R.string.im_a_recruiter, view -> {
                    AppData.userRole = Role.RECRUITER_ID;
                    showIntro();
                })
                .addYellowButton(R.string.im_a_jobseeker, view -> {
                    AppData.userRole = Role.JOB_SEEKER_ID;
                    showIntro();
                });
        popup.setCancelable(false);
        popup.show();
    }

    void showGooglePlayStore() {
        final String appPackageName = getPackageName();
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + appPackageName)));
        } catch (android.content.ActivityNotFoundException e) {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + appPackageName)));
        }
    }

    void showIntro() {
        Intent intent = new Intent(this, IntroActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        finish();
    }

    void showMain() {
        Intent intent = new Intent(this, MainActivity.class);
        startActivity(intent);
        overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
        finish();
    }

    @Override
    protected void showLoading() {
        super.showLoading();
        loading.setBackground(R.color.colorPrimary);
    }

    @Override
    protected void errorHandler(JsonNode errors) {
        super.errorHandler(errors);
        saveData(AppData.KEY_TOKEN, null);
        AppData.clearData();
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        if (mLoginForm.getVisibility() == View.VISIBLE) {
            return new HashMap<String, EditText>() {
                {
                    put("email", mLoginEmail);
                    put("password", mLoginPassword);
                }
            };
        }
        if (mRegisterForm.getVisibility() == View.VISIBLE) {
            return new HashMap<String, EditText>() {
                {
                    put("email", mRegisterEmail);
                    put("password", mRegisterPassword1);
                }
            };
        }
        return new HashMap<String, EditText>() {
            {
                put("email", mResetEmail);
            }
        };
    }

    @OnClick(R.id.sign_in_button)
    void onLogin() {

        if (!valid()) return;

        String email = mLoginEmail.getText().toString().trim();
        String password = mLoginPassword.getText().toString();

        showLoading();

        new APITask(() -> {

            Login login = new Login(email, password);
            AuthToken token = MJPApi.shared().login(login);

            saveData(AppData.KEY_EMAIL, email);
            saveData(AppData.KEY_TOKEN, token.getKey());
            MJPApi.shared().setToken(token);
            AppData.loadData();

        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                checkUserType();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.sign_up_button)
    void onRegister() {

        if (!valid()) return;

        String email = mRegisterEmail.getText().toString().trim();
        String password1 = mRegisterPassword1.getText().toString();
        String password2= mRegisterPassword2.getText().toString();

        showLoading();

        new APITask(() -> {

            Registration registration = new Registration(email, password1, password2);
            AuthToken token = MJPApi.shared().register(registration);

            saveData(AppData.KEY_EMAIL, email);
            saveData(AppData.KEY_TOKEN, token.getKey());
            MJPApi.shared().setToken(token);
            AppData.loadData();

        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                checkUserType();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @OnClick(R.id.reset_button)
    void onReset() {

        if (!valid()) return;

        showLoading();

        new APITask(() -> {

            ResetPassword resetpassword = new ResetPassword(mRegisterEmail.getText().toString().trim());
            MJPApi.shared().resetPassword(resetpassword);

        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();

                new AlertDialog.Builder(LoginActivity.this, android.R.style.Theme_Material_Dialog_Alert)
                        .setMessage(R.string.reset_message)
                        .setPositiveButton(R.string.ok, (dialog, id) -> {
                            mLoginEmail.setText(mResetEmail.getText());
                            onResetCancel();
                        })
                        .setCancelable(false)
                        .create()
                        .show();
            }

            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    @Override
    protected void onResume () {
        super.onResume();

        if (isLoggedin) {
            checkUserType();
        }
    }


    /* navigation */

    @OnClick(R.id.go_register)
    void onShowSignup() {
        movingView(mLoginForm, mRegisterForm);
    }

    @OnClick(R.id.go_login)
    void onShowLogin() {
        movingView(mRegisterForm, mLoginForm);
    }

    @OnClick(R.id.forgot_password)
    void onShowReset() {
        mResetEmail.setText(mLoginEmail.getText());
        movingView(mLoginForm, mResetForm);
    }

    @OnClick(R.id.cancel_button)
    void onResetCancel() {
        movingView(mResetForm, mLoginForm);
    }

    boolean isAnimation = false;

    void movingView(final View fromView, final View toView) {
        if (isAnimation) return;

        hideKeyboard();

        ObjectAnimator animation1 = ObjectAnimator.ofFloat(fromView, "alpha", 0, 0);
        animation1.setDuration(500);
        ObjectAnimator animation2 = ObjectAnimator.ofFloat(toView, "alpha", 0, 1);
        animation2.setDuration(500);

        AnimatorSet animatorSet = new AnimatorSet();
        animatorSet.play(animation1).with(animation2);
        animatorSet.addListener(new Animator.AnimatorListener() {
            @Override
            public void onAnimationStart(Animator animation) {
                isAnimation = true;
                toView.setVisibility(View.VISIBLE);
            }
            @Override
            public void onAnimationEnd(Animator animation) {
                isAnimation = false;
                fromView.setVisibility(View.GONE);
            }
            @Override
            public void onAnimationCancel(Animator animation) {
            }
            @Override
            public void onAnimationRepeat(Animator animation) {
            }
        });
        animatorSet.start();
    }

    @OnClick(R.id.server_url)
    void onSelectServer() {
        new BottomSheetBuilder(this)
                .setMode(BottomSheetBuilder.MODE_LIST)
                .addItem(0, "https://app.myjobpitch.com/", R.drawable.ic_send)
                .addItem(1, "https://test.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(2, "https://demo.sclabs.co.uk/", R.drawable.ic_send)
                .addItem(3, "https://release.sclabs.co.uk/", R.drawable.ic_send)
                .expandOnStart(true)
                .setItemClickListener(item -> {
                    String serverUrl = item.getTitle().toString();
                    MJPApi.instance = null;
                    MJPApi.apiUrl = serverUrl;
                    saveData(AppData.KEY_SERVER_URL, serverUrl);
                    mServerUrl.setText(serverUrl);
                })
                .createDialog()
                .show();
    }
}
