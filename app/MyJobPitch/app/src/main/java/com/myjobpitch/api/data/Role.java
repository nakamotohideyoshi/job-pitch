package com.myjobpitch.api.data;

import com.myjobpitch.api.MJPAPIObject;

public class Role extends MJPAPIObject {

	private String name;
	
	public Role() {
		System.out.println("creating Role");
	}
	
	public String getName() {
		return name;
	}

	@Override
	public String toString() {
		return String.format("%d - %s", this.getId(), this.name);
	}
}
