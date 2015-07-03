package com.myjobpitch.api.auth;

public class AuthToken {
	String key;

	public AuthToken() {}

    public AuthToken(String key) {
        this.key = key;
    }
	
	public String getKey() {
		return key;
	}
}
