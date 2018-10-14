package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

/**
 * Created by dev on 5/12/17.
 */

public class ProductToken extends MJPAPIObject {

    private String sku;
    private Integer tokens;

    public String getSku() {
        return sku;
    }
    public Integer getTokens() {
        return tokens;
    }

}
