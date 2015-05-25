package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import org.springframework.core.io.Resource;

import java.util.List;

public class BusinessImage extends MJPAPIObject {
    private Integer business;
    private Integer order;
    private Resource image;

    public Integer getBusiness() {
        return business;
    }

    public Integer getOrder() {
        return order;
    }

    public Resource getImage() {
        return image;
    }

    public void setBusiness(Integer business) {
        this.business = business;
    }

    public void setImage(Resource image) {
        this.image = image;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
