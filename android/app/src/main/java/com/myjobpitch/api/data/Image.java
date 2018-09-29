package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

/**
 * Created by Jamie on 21/05/2015.
 */
public class Image extends MJPAPIObject {
    private String image;
    private String thumbnail;

    public String getImage() {
        return image;
    }

    public String getThumbnail() {
        return thumbnail;
    }
}
