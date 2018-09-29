package com.myjobpitch.api.data;

public class ChangePassword {
    private String new_password1;
    private String new_password2;

    public ChangePassword(String password1, String password2) {
        this.new_password1 = password1;
        this.new_password2 = password2;
    }

    public String getNew_password1() {
        return new_password1;
    }

    public String getNew_password2() {
        return new_password2;
    }

}
