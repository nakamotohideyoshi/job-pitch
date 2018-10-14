package com.myjobpitch.api.auth;

public class ResetPassword {

    private String email;

    public ResetPassword(String username) {
        this.email = username;
    }

    public String getEmail() {
        return email;
    }

}
