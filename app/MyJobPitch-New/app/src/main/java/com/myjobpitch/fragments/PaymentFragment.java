package com.myjobpitch.fragments;

import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.TextView;

import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.utils.IabBroadcastReceiver;
import com.myjobpitch.utils.IabHelper;
import com.myjobpitch.utils.IabResult;
import com.myjobpitch.utils.Inventory;
import com.myjobpitch.utils.Loading;
import com.myjobpitch.utils.Popup;
import com.myjobpitch.utils.Purchase;
import com.myjobpitch.utils.SkuDetails;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;
import butterknife.OnClick;

public class PaymentFragment extends FormFragment implements IabBroadcastReceiver.IabBroadcastListener {

    @BindView(R.id.business_spinner)
    MaterialBetterSpinner businessSpinner;

    @BindView(R.id.business_credits)
    TextView creditsView;

    @BindView(R.id.sku_spinner)
    MaterialBetterSpinner skuSpinner;

    @BindView(R.id.subscribe_comment)
    TextView sbuscribeView;

    List<Business> businesses;
    Business business;

    Purchase currentPurchase;
    IabHelper mHelper;
    IabBroadcastReceiver mBroadcastReceiver;

    static final String PAYLOAD = "myjobpitch";
    static final String SKU_CREDITS = "tokens_1";
    static final String SKU_SUBSCRIBE = "subscrip";

    static final int RC_REQUEST = 10001;
    static final int SUBSCRIBED_CREDITS = 50;
    static final int ADD_CREDITS = 30;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_payment, container, false);
        ButterKnife.bind(this, view);

        businessSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, new ArrayList<String>()));
        businessSpinner.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                business = businesses.get(i);
                creditsView.setText("Credits: " + business.getTokens());
            }
        });

        skuSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, new ArrayList<String>()));

        Loading.show("Loading...");
        loadBusinesses();

        return  view;
    }

    void loadBusinesses() {

        new APITask(null, this) {
            @Override
            protected void runAPI() throws MJPApiException {
                businesses = MJPApi.shared().getUserBusinesses();
            }
            @Override
            protected void onSuccess() {
                List<String> businessNames = new ArrayList<>();
                for (Business b : businesses) {
                    businessNames.add(b.getName());
                }
                businessSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, businessNames));

                initPament();
            }
        };

    }

    void initPament() {

        String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh6NSnG2gNpaDS8sf6VOIbjLo3pZNhwaO92Y58y3e5pMxoIDHZP0DdUNm36Nm/8W31lOed794EgAqevXu4yQZChGArzKYSOFaLOxTEuEhgBQEsstbwr84K4yrErOnM3yfy2KD5qS4DuEJf4cjlJbaCFMCvKWsk5oT/hNPwuGjJH5eDyxi/U6Hfo746sbvkhSyqQdg89Qfi//Jl2qNdBB4/UzEwJ+9YfpcU5cM7udN3kOaL1mQ8opkXqOWEAjXvuNZ4K2AqerU2ZZCJW+aLzX5bddlFnuq5H5anegJChXCnFsA3WXfxPUwIiiWP5m5GTop76iro6PTo9HZIDa0aUofHQIDAQAB";

        mHelper = new IabHelper(getContext(), base64EncodedPublicKey);
        mHelper.enableDebugLogging(true);
        mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
            public void onIabSetupFinished(IabResult result) {

                if (!result.isSuccess()) {
                    Popup.showError("Problem setting up in-app billing");
                    return;
                }

                if (mHelper == null) return;

                mBroadcastReceiver = new IabBroadcastReceiver(PaymentFragment.this);
                IntentFilter broadcastFilter = new IntentFilter(IabBroadcastReceiver.ACTION);
                getApp().registerReceiver(mBroadcastReceiver, broadcastFilter);

                // IAB is fully set up. Now, let's get an inventory of stuff we own.
                try {
                    ArrayList moreItemSkus = new ArrayList();
                    moreItemSkus.add(SKU_CREDITS);
                    moreItemSkus.add(SKU_CREDITS);
                    mHelper.queryInventoryAsync(true, moreItemSkus, null, mGotInventoryListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    Popup.showError("Error querying inventory. Another async operation in progress.");
                }

            }
        });

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

//        try {
//            NetHttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
//            FileDataStoreFactory dataStoreFactory = new FileDataStoreFactory(new java.io.File(System.getProperty("user.home"), ".store/plus_sample"));
//            // authorization
//
//            GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JacksonFactory.getDefaultInstance(),
//                    new InputStreamReader(PaymentActivity.class.getResourceAsStream("/client_secrets.json")));
//            if (clientSecrets.getDetails().getClientId().startsWith("Enter")
//                    || clientSecrets.getDetails().getClientSecret().startsWith("Enter ")) {
//                System.out.println(
//                        "Enter Client ID and Secret from https://code.google.com/apis/console/?api=plus "
//                                + "into plus-cmdline-sample/src/main/resources/client_secrets.json");
//                System.exit(1);
//            }
//            // set up authorization code flow
//            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
//                    httpTransport, JacksonFactory.getDefaultInstance(), clientSecrets,
//                    Collections.singleton(PlusScopes.PLUS_ME)).setDataStoreFactory(
//                    dataStoreFactory).build();
//            // authorize
//            Credential credential = new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");
//
//            // set up global Plus instance
//            Plus plus = new Plus.Builder(httpTransport, JacksonFactory.getDefaultInstance(), credential).setApplicationName(
//                    "MJP-MyJobPitch/1.0").build();
//
//            // ...
//        } catch (Exception ex) {
//            complain(ex.getLocalizedMessage());
//        }
    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("business", businessSpinner);
                put("sku", skuSpinner);
            }
        };
    }

    @OnClick(R.id.purchase_button)
    public void onClickPurchase() {
        if (!valid()) return;

        String sku = skuSpinner.getText().toString();

        Loading.show(null);
        try {
            mHelper.launchPurchaseFlow(getApp(), sku, RC_REQUEST, mPurchaseFinishedListener, PAYLOAD);
        } catch (IabHelper.IabAsyncInProgressException e) {
            Popup.showError("Error launching purchase flow. Another async operation in progress.");
        }
    }

    @OnClick(R.id.subscribe_button)
    public void onClickSubscribe() {
        if (!mHelper.subscriptionsSupported()) {
            Popup.showError("Subscriptions not supported on your device yet. Sorry!");
            return;
        }

//        Loading.show(null);
//        try {
//            mHelper.launchPurchaseFlow(getApp(), SKU_SUBSCRIBE, RC_REQUEST, mPurchaseFinishedListener, PAYLOAD);
//        } catch (IabHelper.IabAsyncInProgressException e) {
//            Popup.showError("Error launching purchase flow. Another async operation in progress.");
//        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // very important:
        if (mBroadcastReceiver != null) {
            getApp().unregisterReceiver(mBroadcastReceiver);
        }

        // very important:
        if (mHelper != null) {
            mHelper.disposeWhenFinished();
            mHelper = null;
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        Loading.hide();

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
            Popup.showError("Error querying inventory. Another async operation in progress.");
        }
    }

    protected  void sendPurchaseInfoToServer() {
        Loading.show("Updating...");
        String productId = currentPurchase.getSku();
        String purchaseToken = currentPurchase.getToken();
        (new SendPurchaseInfoTask(productId, purchaseToken)).execute();
    }

    private class SendPurchaseInfoTask extends AsyncTask<Void, Void, Business> {
        final String productId;
        final String purchaseToken;

        public SendPurchaseInfoTask(String productId, String purchaseToken) {
            this.productId = productId;
            this.purchaseToken = purchaseToken;
        }

        @Override
        protected Business doInBackground(Void... params) {
            try {
                try {
                    return MJPApi.shared().sendPurchaseInfo(business.getId(), productId, purchaseToken);
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
            if (business == null ) {
                Popup.showError("Connection Error: Please check your internet connection");
            } else {
                try {
                    Loading.show("Processing...");
                    mHelper.consumeAsync(currentPurchase, mConsumeFinishedListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    e.printStackTrace();
                }
                creditsView.setText("Credits: " + business.getTokens());
            }
        }

        @Override
        protected void onCancelled() {
            Loading.hide();
        }
    }

    IabHelper.QueryInventoryFinishedListener mGotInventoryListener = new IabHelper.QueryInventoryFinishedListener() {
        public void onQueryInventoryFinished(IabResult result, Inventory inventory) {

            if (mHelper == null) {
                return;
            };

            if (result.isFailure()) {
                Popup.showError("Failed to query inventory: " + result);
                return;
            }

            Loading.hide();

            SkuDetails subscribeDetails = inventory.getSkuDetails(SKU_SUBSCRIBE);
            if (subscribeDetails != null) {
//                Purchase subscribe = inventory.getPurchase(SKU_SUBSCRIBE);
//                mSubscribedToInfiniteCredits = (subscribe != null && subscribe.getDeveloperPayload() == PAYLOAD);
//                if (mSubscribedToInfiniteCredits) {
//                    mCredits += SUBSCRIBED_CREDITS;
//                    saveData();
//                } else {
//                    subscribeButton.setEnabled(true);
//                    subscribeButton.setAlpha(1);
//                }
                sbuscribeView.setText("(50 Credits / " + subscribeDetails.getPrice() + ")");
            }

            List<String> items = new ArrayList<>();
            SkuDetails addDetails = inventory.getSkuDetails(SKU_CREDITS);
            if (addDetails != null) {
                items.add("30 Credits / " + addDetails.getPrice());
            }
            skuSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, items));

            Purchase creditPurchase = inventory.getPurchase(SKU_CREDITS);
            if (creditPurchase != null && creditPurchase.getDeveloperPayload().equals(PAYLOAD)) {
                businessSpinner.setText(SKU_CREDITS);
                currentPurchase = creditPurchase;
                sendPurchaseInfoToServer();
                return;
            }

        }
    };

    IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener = new IabHelper.OnIabPurchaseFinishedListener() {
        public void onIabPurchaseFinished(IabResult result, Purchase purchase) {

            if (mHelper == null) return;

            if (result.isFailure()) {
                Popup.showError("Error purchasing: " + result);
                return;
            }
            if (!purchase.getDeveloperPayload().equals(PAYLOAD)) {
                Popup.showError("Error purchasing. Authenticity verification failed.");
                return;
            }

            Loading.hide();

            if (purchase.getSku().equals(SKU_CREDITS)) {
                currentPurchase = purchase;
                sendPurchaseInfoToServer();
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

            if (mHelper == null) return;

            if (result.isSuccess()) {
                Loading.hide();
                currentPurchase = null;
            } else {
                Popup.showError("Error while consuming: " + result);
            }

        }
    };

}
