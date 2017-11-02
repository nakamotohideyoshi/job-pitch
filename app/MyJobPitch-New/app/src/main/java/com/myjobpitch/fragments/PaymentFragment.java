package com.myjobpitch.fragments;

import android.content.Context;
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
import android.widget.ListView;
import android.widget.TextView;

import com.fasterxml.jackson.databind.JsonNode;
import com.myjobpitch.R;
import com.myjobpitch.api.MJPApi;
import com.myjobpitch.api.MJPApiException;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.ProductToken;
import com.myjobpitch.tasks.APIAction;
import com.myjobpitch.tasks.APITask;
import com.myjobpitch.tasks.APITaskListener;
import com.myjobpitch.utils.IabBroadcastReceiver;
import com.myjobpitch.utils.IabHelper;
import com.myjobpitch.utils.IabResult;
import com.myjobpitch.utils.Inventory;
import com.myjobpitch.views.Popup;
import com.myjobpitch.utils.Purchase;
import com.myjobpitch.utils.SkuDetails;
import com.weiwangcn.betterspinner.library.material.MaterialBetterSpinner;

import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import butterknife.BindView;
import butterknife.ButterKnife;

public class PaymentFragment extends FormFragment implements IabBroadcastReceiver.IabBroadcastListener {

    @BindView(R.id.business_spinner)
    MaterialBetterSpinner businessSpinner;

    @BindView(R.id.business_credits)
    TextView creditsView;

    @BindView(R.id.product_list)
    ListView productListView;

    public Business business;

    private List<Business> businesses;
    private ArrayList<ProductModel> products;

    private ProductAdapter productAdapter;

    private Purchase currentPurchase;
    private IabHelper mHelper;
    private IabBroadcastReceiver mBroadcastReceiver;

    private static final String PAYLOAD = "myjobpitch";
    private static final int RC_REQUEST = 10001;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_payment, container, false);
        ButterKnife.bind(this, view);

        title = "Add Credits";

        businessSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, new ArrayList<String>()));
        businessSpinner.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int i, long l) {
                business = businesses.get(i);
                creditsView.setText("Credits: " + business.getTokens());
            }
        });

        productAdapter = new ProductAdapter(getApp(), new ArrayList<ProductModel>());
        productListView.setAdapter(productAdapter);

        showLoading(view);
        loadData();

        return view;
    }

    void loadData() {
        new APITask(new APIAction() {
            @Override
            public void run() throws MJPApiException {
                businesses = MJPApi.shared().getUserBusinesses();
                List<ProductToken> productTokens = MJPApi.shared().get(ProductToken.class);

                products = new ArrayList<>();
                for (ProductToken pt : productTokens) {
                    products.add(new ProductModel(pt.getSku(), pt.getTokens()));
                }
            }
        }).addListener(new APITaskListener() {
            @Override
            public void onSuccess() {
                hideLoading();
                List<String> businessNames = new ArrayList<>();
                for (Business b : businesses) {
                    businessNames.add(b.getName());
                    if (business != null && business.getName().equals(b.getName())) {
                        businessSpinner.setText(business.getName());
                        creditsView.setText("Credits: " + business.getTokens());
                    }
                }
                businessSpinner.setAdapter(new ArrayAdapter<>(getApp(),  android.R.layout.simple_dropdown_item_1line, businessNames));

                initPament();
            }
            @Override
            public void onError(JsonNode errors) {
                errorHandler(errors);
            }
        }).execute();
    }

    void initPament() {

        String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAh6NSnG2gNpaDS8sf6VOIbjLo3pZNhwaO92Y58y3e5pMxoIDHZP0DdUNm36Nm/8W31lOed794EgAqevXu4yQZChGArzKYSOFaLOxTEuEhgBQEsstbwr84K4yrErOnM3yfy2KD5qS4DuEJf4cjlJbaCFMCvKWsk5oT/hNPwuGjJH5eDyxi/U6Hfo746sbvkhSyqQdg89Qfi//Jl2qNdBB4/UzEwJ+9YfpcU5cM7udN3kOaL1mQ8opkXqOWEAjXvuNZ4K2AqerU2ZZCJW+aLzX5bddlFnuq5H5anegJChXCnFsA3WXfxPUwIiiWP5m5GTop76iro6PTo9HZIDa0aUofHQIDAQAB";

        mHelper = new IabHelper(getContext(), base64EncodedPublicKey);
        mHelper.enableDebugLogging(true);
        mHelper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
            public void onIabSetupFinished(IabResult result) {

                if (!result.isSuccess()) {
                    Popup popup = new Popup(getContext(), "Problem setting up in-app billing", true);
                    popup.addGreyButton("Ok", null);
                    popup.show();
                    return;
                }

                mBroadcastReceiver = new IabBroadcastReceiver(PaymentFragment.this);
                IntentFilter broadcastFilter = new IntentFilter(IabBroadcastReceiver.ACTION);
                getApp().registerReceiver(mBroadcastReceiver, broadcastFilter);

                // IAB is fully set up. Now, let's get an inventory of stuff we own.
                ArrayList skus = new ArrayList();
                for (ProductModel p : products) {
                    skus.add(p.sku);
                }
                try {
                    mHelper.queryInventoryAsync(true, skus, null, mGotInventoryListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    Popup popup = new Popup(getContext(), "Error querying inventory. Another async operation in progress.", true);
                    popup.addGreyButton("Ok", null);
                    popup.show();
                }

            }
        });

    }

    @Override
    protected HashMap<String, EditText> getRequiredFields() {
        return new HashMap<String, EditText>() {
            {
                put("business", businessSpinner);
            }
        };
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
//        Loading.hide();

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
            Popup popup = new Popup(getContext(), "Error querying inventory. Another async operation in progress.", true);
            popup.addGreyButton("Ok", null);
            popup.show();
        }
    }

    void sendPurchaseInfoToServer() {
//        Loading.show("Updating...");
        new SendPurchaseTask().execute();
    }

    IabHelper.QueryInventoryFinishedListener mGotInventoryListener = new IabHelper.QueryInventoryFinishedListener() {
        public void onQueryInventoryFinished(IabResult result, Inventory inventory) {

//            Loading.hide();

            if (result.isFailure()) {
                Popup popup = new Popup(getContext(), "Failed to query inventory: " + result, true);
                popup.addGreyButton("Ok", null);
                popup.show();
                return;
            }

            getView().setVisibility(View.VISIBLE);

            for (ProductModel p : products) {
                SkuDetails details = inventory.getSkuDetails(p.sku);
                if (details != null) {
                    p.price = details.getPrice();
                }
            }

            productAdapter.addAll(products);

            for (ProductModel p : products) {
                Purchase creditPurchase = inventory.getPurchase(p.sku);
                if (creditPurchase != null && creditPurchase.getDeveloperPayload().equals(PAYLOAD)) {
                    currentPurchase = creditPurchase;
                    sendPurchaseInfoToServer();
                    break;
                }
            }

        }
    };

    IabHelper.OnIabPurchaseFinishedListener mPurchaseFinishedListener = new IabHelper.OnIabPurchaseFinishedListener() {
        public void onIabPurchaseFinished(IabResult result, Purchase purchase) {

            if (result.isFailure()) {
                Popup popup = new Popup(getContext(), "Error purchasing: " + result, true);
                popup.addGreyButton("Ok", null);
                popup.show();
                return;
            }
            if (!purchase.getDeveloperPayload().equals(PAYLOAD)) {
                Popup popup = new Popup(getContext(), "Error purchasing. Authenticity verification failed.", true);
                popup.addGreyButton("Ok", null);
                popup.show();
                return;
            }

//            Loading.hide();

            currentPurchase = purchase;
            sendPurchaseInfoToServer();
        }
    };

    IabHelper.OnConsumeFinishedListener mConsumeFinishedListener = new IabHelper.OnConsumeFinishedListener() {
        public void onConsumeFinished(Purchase purchase, IabResult result) {

            if (result.isSuccess()) {
//                Loading.hide();
                currentPurchase = null;
            } else {
                Popup popup = new Popup(getContext(), "Error while consuming: " + result, true);
                popup.addGreyButton("Ok", null);
                popup.show();
            }
        }
    };


    // product adapter

    class ProductAdapter extends ArrayAdapter<ProductModel> {
        public ProductAdapter(Context context, ArrayList<ProductModel> products) {
            super(context, 0, products);
        }

        @Override
        public View getView(final int position, View convertView, ViewGroup parent) {
            if (convertView == null) {
                convertView = LayoutInflater.from(getContext()).inflate(R.layout.cell_product_list, parent, false);
            }

            ((TextView)convertView.findViewById(R.id.product_credits)).setText(getItem(position).tokens + " Credits");
            ((TextView)convertView.findViewById(R.id.product_price)).setText(getItem(position).price);

            convertView.findViewById(R.id.product_buy).setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {

                    if (!valid())
                        return;

                    ProductModel product = getItem(position);
                    try {
                        mHelper.launchPurchaseFlow(getApp(), product.sku, RC_REQUEST, mPurchaseFinishedListener, PAYLOAD);
                    } catch (IabHelper.IabAsyncInProgressException e) {
                        Popup popup = new Popup(getContext(), "Error launching purchase flow. Another async operation in progress.", true);
                        popup.addGreyButton("Ok", null);
                        popup.show();
                    }
                }
            });

            return convertView;
        }
    }

    class ProductModel {
        public String sku;
        public Integer tokens;
        public String price;
        public ProductModel(String sku, Integer tokens) {
            this.sku = sku;
            this.tokens = tokens;
        }
    }


    private class SendPurchaseTask extends AsyncTask<Void, Void, Business> {

        @Override
        protected Business doInBackground(Void... params) {
            String productId = currentPurchase.getSku();
            String purchaseToken = currentPurchase.getToken();

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
        protected void onPostExecute(Business business) {
            if (business == null ) {
                Popup popup = new Popup(getContext(), "Connection Error: Please check your internet connection", true);
                popup.addGreyButton("Ok", null);
                popup.show();
            } else {
                try {
//                        Loading.show("Processing...");
                    mHelper.consumeAsync(currentPurchase, mConsumeFinishedListener);
                } catch (IabHelper.IabAsyncInProgressException e) {
                    e.printStackTrace();
                }
                creditsView.setText("Credits: " + business.getTokens());
            }
        }

    }

}
