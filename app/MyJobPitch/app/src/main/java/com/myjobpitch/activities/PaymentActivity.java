package com.myjobpitch.activities;

import android.app.AlertDialog;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Bundle;
import android.system.ErrnoException;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

//import com.google.api.services.androidpublisher.AndroidPublisher;
//import com.google.api.services.androidpublisher.model.InAppProduct;
//import com.google.api.services.androidpublisher.model.InappproductsBatchResponse;
//import com.google.api.services.androidpublisher.model.InappproductsListResponse;
import com.myjobpitch.MJPApplication;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
//import com.myjobpitch.utils.AndroidPublisherHelper;
//import com.myjobpitch.utils.ApplicationConfig;
import com.myjobpitch.utils.IabBroadcastReceiver;
import com.myjobpitch.utils.IabBroadcastReceiver.IabBroadcastListener;
import com.myjobpitch.utils.IabHelper;
import com.myjobpitch.utils.IabResult;
import com.myjobpitch.utils.Inventory;
import com.myjobpitch.utils.Purchase;
import com.myjobpitch.utils.SkuDetails;

import org.springframework.web.client.RestClientException;

import java.io.IOException;
import java.util.ArrayList;

public class PaymentActivity extends MJPProgressActionBarActivity implements IabBroadcastListener {

    private View main_view;
    private View mProgressView;

    private int business_id;

    private Button addButton;
    private Button sendButton;
    private Button consumeButton;
    private TextView statusText;

    private Button subscribeButton;

    static final String PAYLOAD = "myjobpitch";
    static final String SKU_CREDITS = "tokens_1";
    static final String SKU_SUBSCRIBE = "subscrip";

    static final int RC_REQUEST = 10001;

    static final int SUBSCRIBED_CREDITS = 50;
    static final int ADD_CREDITS = 30;

    Purchase currentPurchase;
    IabHelper mHelper;
    IabBroadcastReceiver mBroadcastReceiver;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_payment);

        main_view = findViewById(R.id.main_view);
        mProgressView = findViewById(R.id.progress);

        business_id = getIntent().getIntExtra("business_id", 0);
        int credits = getIntent().getIntExtra("credits", 0);
        TextView current_credits = (TextView)findViewById(R.id.current_credits);
        current_credits.setText("Current Credits: " + credits);

        String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh6NSnG2gNpaDS8sf6VOIbjLo3pZNhwaO92Y58y3e5pMxoIDHZP0DdUNm36Nm/8W31lOed794EgAqevXu4yQZChGArzKYSOFaLOxTEuEhgBQEsstbwr84K4yrErOnM3yfy2KD5qS4DuEJf4cjlJbaCFMCvKWsk5oT/hNPwuGjJH5eDyxi/U6Hfo746sbvkhSyqQdg89Qfi//Jl2qNdBB4/UzEwJ+9YfpcU5cM7udN3kOaL1mQ8opkXqOWEAjXvuNZ4K2AqerU2ZZCJW+aLzX5bddlFnuq5H5anegJChXCnFsA3WXfxPUwIiiWP5m5GTop76iro6PTo9HZIDa0aUofHQIDAQAB";

        mHelper = new IabHelper(this, base64EncodedPublicKey);
        mHelper.enableDebugLogging(true);
        mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
            public void onIabSetupFinished(IabResult result) {

                if (!result.isSuccess()) {
                    complain("Problem setting up in-app billing");
                    return;
                }

                if (mHelper == null) return;

                mBroadcastReceiver = new IabBroadcastReceiver(PaymentActivity.this);
                IntentFilter broadcastFilter = new IntentFilter(IabBroadcastReceiver.ACTION);
                registerReceiver(mBroadcastReceiver, broadcastFilter);

                // IAB is fully set up. Now, let's get an inventory of stuff we own.
                try {
                    ArrayList moreItemSkus = new ArrayList();
                    moreItemSkus.add(SKU_CREDITS);
                    mHelper.queryInventoryAsync(true, moreItemSkus, null, mGotInventoryListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    complain("Error querying inventory. Another async operation in progress.");
                }

            }
        });


        addButton = (Button)findViewById(R.id.purchase_button);
        addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showProgress(true);
                try {
                    mHelper.launchPurchaseFlow(PaymentActivity.this, SKU_CREDITS, RC_REQUEST,
                            mPurchaseFinishedListener, PAYLOAD);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    complain("Error launching purchase flow. Another async operation in progress.");
                    showProgress(false);
                }
            }
        });

        sendButton = (Button)findViewById(R.id.send_button);
        sendButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendPurchaseInfoToServer();
            }
        });

        consumeButton = (Button)findViewById(R.id.consume_button);
        consumeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                showProgress(true);
                try {
                    mHelper.consumeAsync(currentPurchase, mConsumeFinishedListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    complain("Error consuming gas. Another async operation in progress.");
                    showProgress(false);
                }
            }
        });

        statusText = (TextView)findViewById(R.id.status_text);

//        subscribeButton = (Button)findViewById(R.id.subscribe_button);
//        subscribeButton.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                if (!mHelper.subscriptionsSupported()) {
//                    complain("Subscriptions not supported on your device yet. Sorry!");
//                    return;
//                }
//
//                showProgress(true);
//                mHelper.launchPurchaseFlow(PaymentActivity.this,
//                        SKU_SUBSCRIBE, IabHelper.ITEM_TYPE_SUBS,
//                        RC_REQUEST, mPurchaseFinishedListener, PAYLOAD);
//            }
//        });

        showProgress(false);


//        try {
//            AndroidPublisher androidPublisher = AndroidPublisherHelper.init(ApplicationConfig.APPLICATION_NAME);
//            InappproductsListResponse list = androidPublisher.inappproducts().list(ApplicationConfig.PACKAGE_NAME).execute();
//            for (InAppProduct p : list.getInappproduct()) {
//                int i = 0;
//            }
//
//        } catch (Exception ex) {
//            complain(ex.getLocalizedMessage());
//        }


    }

    private void setButtonEnable(Button button, boolean enable) {
        button.setAlpha(enable?1:0.3f);
        button.setEnabled(enable);
    }

    @Override
    public View getProgressView() {
        return mProgressView;
    }

    @Override
    public View getMainView() {
        return main_view;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // very important:
        if (mBroadcastReceiver != null) {
            unregisterReceiver(mBroadcastReceiver);
        }

        // very important:
        if (mHelper != null) {
            mHelper.disposeWhenFinished();
            mHelper = null;
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        showProgress(false);

        if (mHelper == null) return;

        if (!mHelper.handleActivityResult(requestCode, resultCode, data)) {
            super.onActivityResult(requestCode, resultCode, data);
        } else {
        }
    }

    @Override
    public void receivedBroadcast() {
        // Received a broadcast notification that the inventory of items has changed
        try {
            mHelper.queryInventoryAsync(mGotInventoryListener);
        } catch (IabHelper.IabAsyncInProgressException e) {
            complain("Error querying inventory. Another async operation in progress.");
        }
    }

    protected  void sendPurchaseInfoToServer() {
        showProgress(true);
        String productId = currentPurchase.getSku();
        String purchaseToken = currentPurchase.getToken();
        (new SendPurchaseInfoTask(productId, purchaseToken)).execute();
    }

    private class SendPurchaseInfoTask extends AsyncTask<Void, Void, Business> {
        private final String productId;
        private final String purchaseToken;

        public SendPurchaseInfoTask(String productId, String purchaseToken) {
            this.productId = productId;
            this.purchaseToken = purchaseToken;
        }

        @Override
        protected Business doInBackground(Void... params) {
            MJPApplication application = (MJPApplication) getApplication();
            MJPApi api = application.getApi();
            try {
                try {
                    return api.sendPurchaseInfo(business_id, productId, purchaseToken);
                } catch (MJPApiException e) {
                    e.printStackTrace();
                }
            } catch (RestClientException e) {
                e.printStackTrace();
            }
            return null;
        }

        @Override
        protected void onPostExecute(final Business business) {
            showProgress(false);
            if (business == null ) {
                complain("Connection Error: Please check your internet connection");
            } else {
                //mHelper.consumeAsync(currentPurchase, mConsumeFinishedListener);
                setButtonEnable(sendButton, false);
                setButtonEnable(consumeButton, true);

                TextView current_credits = (TextView)findViewById(R.id.current_credits);
                current_credits.setText("Current Credits: " + business.getTokens());
            }
        }

        @Override
        protected void onCancelled() {
            showProgress(false);
        }
    }

    IabHelper.QueryInventoryFinishedListener mGotInventoryListener = new IabHelper.QueryInventoryFinishedListener() {
        public void onQueryInventoryFinished(IabResult result, Inventory inventory) {

            if (mHelper == null) return;

            if (result.isFailure()) {
                complain("Failed to query inventory: " + result);
                return;
            }

//            SkuDetails subscribeDetails = inventory.getSkuDetails(SKU_SUBSCRIBE);
//
//            if (subscribeDetails != null) {
//                Purchase subscribe = inventory.getPurchase(SKU_SUBSCRIBE);
//                mSubscribedToInfiniteCredits = (subscribe != null && subscribe.getDeveloperPayload() == PAYLOAD);
//                if (mSubscribedToInfiniteCredits) {
//                    mCredits += SUBSCRIBED_CREDITS;
//                    saveData();
//                } else {
//                    subscribeButton.setEnabled(true);
//                    subscribeButton.setAlpha(1);
//                }
//
//                TextView subscribe_comment = (TextView)findViewById(R.id.subscribe_comment);
//                subscribe_comment.setText("(50 Credits / " + subscribeDetails.getPrice() + ")");
//            }

            SkuDetails addDetails = inventory.getSkuDetails(SKU_CREDITS);
            if (addDetails != null) {
                TextView add_comment = (TextView)findViewById(R.id.add_comment);
                add_comment.setText("(30 Credits / " + addDetails.getPrice() + ")");
            }

            Purchase creditPurchase = inventory.getPurchase(SKU_CREDITS);
            if (creditPurchase != null && creditPurchase.getDeveloperPayload().equals(PAYLOAD)) {
                //sendPurchaseInfoToServer(creditPurchase);
                currentPurchase = creditPurchase;
                setButtonEnable(sendButton, true);
                statusText.setText("You have purchased already.");
                return;
            }

            setButtonEnable(addButton, true);

        }
    };

    IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener = new IabHelper.OnIabPurchaseFinishedListener() {
        public void onIabPurchaseFinished(IabResult result, Purchase purchase) {

            showProgress(false);

            if (mHelper == null) return;

            if (result.isFailure()) {
                complain("Error purchasing: " + result);
                return;
            }
            if (!purchase.getDeveloperPayload().equals(PAYLOAD)) {
                complain("Error purchasing. Authenticity verification failed.");
                return;
            }

            if (purchase.getSku().equals(SKU_CREDITS)) {
                //sendPurchaseInfoToServer(purchase);
                currentPurchase = purchase;
                setButtonEnable(addButton, false);
                setButtonEnable(sendButton, true);
                statusText.setText("You are purchase was successfully.");
            } else if (purchase.getSku().equals(SKU_SUBSCRIBE)) {
//                mSubscribedToInfiniteCredits = true;
//                mCredits += SUBSCRIBED_CREDITS;
//                saveData();
//                alert("Thank you for subscription!");
            }
        }
    };

    IabHelper.OnConsumeFinishedListener mConsumeFinishedListener = new IabHelper.OnConsumeFinishedListener() {
        public void onConsumeFinished(Purchase purchase, IabResult result) {

            showProgress(false);

            if (mHelper == null) return;

            if (result.isSuccess()) {
                currentPurchase = null;
                setButtonEnable(consumeButton, false);
                setButtonEnable(addButton, true);
                statusText.setText("consume successfully!");
            } else {
                complain("Error while consuming: " + result);
            }

        }
    };

    void complain(String message) {
        alert(message);
        statusText.setText("Error: " + message);
    }

    void alert(String message) {
        AlertDialog.Builder bld = new AlertDialog.Builder(this);
        bld.setMessage(message);
        bld.setNeutralButton("OK", null);
        bld.create().show();
    }

}
