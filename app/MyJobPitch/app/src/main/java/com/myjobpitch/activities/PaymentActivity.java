package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.utils.IabHelper;
import com.myjobpitch.utils.IabResult;
import com.myjobpitch.utils.Inventory;
import com.myjobpitch.utils.Purchase;
import com.myjobpitch.utils.SkuDetails;

public class PaymentActivity extends MJPProgressActionBarActivity {

    private View mChangePasswordView;
    private View mProgressView;

    private Button addButton;
    private Button subscribeButton;

    static final String PAYLOAD = "myjobpitch";
    static final String SKU_CREDITS = "credits";
    static final String SKU_SUBSCRIBE = "subscrip";

    static final int RC_REQUEST = 10001;

    static final int SUBSCRIBED_CREDITS = 50;
    static final int ADD_CREDITS = 30;

    boolean mSubscribedToInfiniteCredits = false;

    int mCredits;

    IabHelper mHelper;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        mChangePasswordView = findViewById(R.id.change_password);
        mProgressView = findViewById(R.id.progress);

        //getIntent().getIntExtra("business_id", 0);
        mCredits = getIntent().getIntExtra("credits", 0);
        TextView current_credits = (TextView)findViewById(R.id.current_credits);
        current_credits.setText("Current Credits: " + mCredits);

        String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh6NSnG2gNpaDS8sf6VOIbjLo3pZNhwaO92Y58y3e5pMxoIDHZP0DdUNm36Nm/8W31lOed794EgAqevXu4yQZChGArzKYSOFaLOxTEuEhgBQEsstbwr84K4yrErOnM3yfy2KD5qS4DuEJf4cjlJbaCFMCvKWsk5oT/hNPwuGjJH5eDyxi/U6Hfo746sbvkhSyqQdg89Qfi//Jl2qNdBB4/UzEwJ+9YfpcU5cM7udN3kOaL1mQ8opkXqOWEAjXvuNZ4K2AqerU2ZZCJW+aLzX5bddlFnuq5H5anegJChXCnFsA3WXfxPUwIiiWP5m5GTop76iro6PTo9HZIDa0aUofHQIDAQAB";

        mHelper = new IabHelper(this, base64EncodedPublicKey);
        mHelper.enableDebugLogging(false);
        mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
            public void onIabSetupFinished(IabResult result) {

                if (!result.isSuccess()) {
                    complain("Problem setting up in-app billing");
                    return;
                }

                if (mHelper == null) return;

                mHelper.queryInventoryAsync(mGotInventoryListener);

            }
        });


        addButton = (Button)findViewById(R.id.add_button);
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showProgress(true);
                mHelper.launchPurchaseFlow(PaymentActivity.this, SKU_CREDITS, RC_REQUEST,
                        mPurchaseFinishedListener, PAYLOAD);
            }
        });

        subscribeButton = (Button)findViewById(R.id.subscribe_button);
        subscribeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (!mHelper.subscriptionsSupported()) {
                    complain("Subscriptions not supported on your device yet. Sorry!");
                    return;
                }

                showProgress(true);
                mHelper.launchPurchaseFlow(PaymentActivity.this,
                        SKU_SUBSCRIBE, IabHelper.ITEM_TYPE_SUBS,
                        RC_REQUEST, mPurchaseFinishedListener, PAYLOAD);
            }
        });

    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return mChangePasswordView;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (mHelper != null) {
            mHelper.dispose();
            mHelper = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (mHelper == null) return;
    }

    IabHelper.QueryInventoryFinishedListener mGotInventoryListener = new IabHelper.QueryInventoryFinishedListener() {
        public void onQueryInventoryFinished(IabResult result, Inventory inventory) {

            if (mHelper == null) return;

            if (result.isFailure()) {
                complain("Failed to query inventory");
                return;
            }

            SkuDetails subscribeDetails = inventory.getSkuDetails(SKU_SUBSCRIBE);

            if (subscribeDetails != null) {
                Purchase subscribe = inventory.getPurchase(SKU_SUBSCRIBE);
                mSubscribedToInfiniteCredits = (subscribe != null && subscribe.getDeveloperPayload() == PAYLOAD);
                if (mSubscribedToInfiniteCredits) {
                    mCredits += SUBSCRIBED_CREDITS;
                    saveData();
                } else {
                    subscribeButton.setEnabled(true);
                    subscribeButton.setAlpha(1);
                }

                TextView subscribe_comment = (TextView)findViewById(R.id.subscribe_comment);
                subscribe_comment.setText("(50 Credits / " + subscribeDetails.getPrice() + ")");
            }

            SkuDetails addDetails = inventory.getSkuDetails(SKU_CREDITS);
            TextView add_comment = (TextView)findViewById(R.id.add_comment);
            if (addDetails != null) {
                addButton.setEnabled(true);
                addButton.setAlpha(1);
                add_comment.setText("(30 Credits / " + addDetails.getPrice() + ")");

                Purchase creditPurchase = inventory.getPurchase(SKU_CREDITS);
                if (creditPurchase != null && creditPurchase.getDeveloperPayload() == PAYLOAD) {
                    mHelper.consumeAsync(inventory.getPurchase(SKU_CREDITS), mConsumeFinishedListener);
                    return;
                }
            }

            showProgress(false);
        }
    };

    IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener = new IabHelper.OnIabPurchaseFinishedListener() {
        public void onIabPurchaseFinished(IabResult result, Purchase purchase) {

            if (mHelper == null) return;

            if (result.isFailure()) {
                complain("Error purchasing: " + result);
                showProgress(false);
                return;
            }
            if (purchase.getDeveloperPayload() != PAYLOAD) {
                complain("Error purchasing. Authenticity verification failed.");
                showProgress(false);
                return;
            }

            if (purchase.getSku().equals(SKU_CREDITS)) {
                mHelper.consumeAsync(purchase, mConsumeFinishedListener);
            } else if (purchase.getSku().equals(SKU_SUBSCRIBE)) {
                mSubscribedToInfiniteCredits = true;
                mCredits += SUBSCRIBED_CREDITS;
                saveData();
                alert("Thank you for subscription!");
                showProgress(false);
            }
        }
    };

    IabHelper.OnConsumeFinishedListener mConsumeFinishedListener = new IabHelper.OnConsumeFinishedListener() {
        public void onConsumeFinished(Purchase purchase, IabResult result) {

            if (mHelper == null) return;

            if (result.isSuccess()) {
                mCredits = mCredits + ADD_CREDITS;
                saveData();
                alert("Thank you for purchasing!");
            } else {
                complain("Error while consuming");
            }
            showProgress(false);
        }
    };

    void complain(String message) {
        alert("Error: " + message);
    }

    void alert(String message) {
        AlertDialog.Builder bld = new AlertDialog.Builder(this);
        bld.setMessage(message);
        bld.setNeutralButton("OK", null);
        bld.create().show();
    }

    void saveData() {

    }
}
