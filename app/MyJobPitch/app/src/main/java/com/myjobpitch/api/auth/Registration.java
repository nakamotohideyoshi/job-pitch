package com.myjobpitch.api.auth;

public class Registration {
    private String username;
    private String email;
    private String password1;
    private String password2;

    public Registration(String username, String email, String password1, String password2) {
        this.username = username;
        this.email = email;
        this.password1 = password1;
        this.password2 = password2;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword1() {
        return password1;
    }

    public String getPassword2() {
        return password2;
    }
}
