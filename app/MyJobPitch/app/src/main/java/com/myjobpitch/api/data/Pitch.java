package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

/**
 * Created by Jamie on 21/05/2015.
 */
public class Pitch extends MJPAPIObject {
    private String video;
    private String image;
    private String thumbnail;

    public String getVideo() {
        return video;
    }

    public String getImage() {
        return image;
    }

    public String getThumbnail() {
        return thumbnail;
    }
}
