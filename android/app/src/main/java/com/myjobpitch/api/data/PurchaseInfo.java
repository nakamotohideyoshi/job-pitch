package com.myjobpitch.api.data;

public class PurchaseInfo {

    private Integer business_id;
    private String product_code;
    private String purchase_token;

    public PurchaseInfo(Integer businessId, String productId, String purchaseToken) {
        this.business_id = businessId;
        this.product_code = productId;
        this.purchase_token = purchaseToken;
    }

    public Integer getBusiness_id() {
        return business_id;
    }
    public String getProduct_code() {
        return product_code;
    }
    public String getPurchase_token() {
        return purchase_token;
    }

}
