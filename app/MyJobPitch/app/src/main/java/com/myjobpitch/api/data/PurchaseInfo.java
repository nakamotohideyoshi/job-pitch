package com.myjobpitch.api.data;

public class PurchaseInfo {
    private Integer businessId;
    private String productId;
    private String purchaseToken;

    public PurchaseInfo(Integer businessId, String productId, String purchaseToken) {
        this.businessId = businessId;
        this.productId = productId;
        this.purchaseToken = purchaseToken;
    }

    public Integer getBusinessId() {
        return businessId;
    }

    public String getProductId() {
        return productId;
    }

    public String getPurchaseToken() {
        return purchaseToken;
    }

}
