package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

import org.springframework.core.io.Resource;

public class ImageUpload extends MJPAPIObject {
    private Integer object;
    private Integer order;
    private Resource image;

    public Integer getObject() {
        return object;
    }

    public Integer getOrder() {
        return order;
    }

    public Resource getImage() {
        return image;
    }

    public void setObject(Integer object) {
        this.object = object;
    }

    public void setImage(Resource image) {
        this.image = image;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }
}
