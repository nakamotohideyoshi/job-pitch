package com.myjobpitch.api.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ApplicationForCreationWithPitch extends ApplicationForCreation {

    Integer pitch;

    public ApplicationForCreationWithPitch() {
    };
    public ApplicationForCreationWithPitch(Integer pitch) {
        this.pitch = pitch;
    }

    public Integer getPitch() {
        return pitch;
    }

}
