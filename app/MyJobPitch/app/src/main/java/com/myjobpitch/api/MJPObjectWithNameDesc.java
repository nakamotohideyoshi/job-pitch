package com.myjobpitch.api;

public class MJPObjectWithNameDesc extends MJPAPIObject {
	private String name;
	private String description;

	public String getName() {
		return this.name;
	}
	
	public String getDescription() {
		return description;
	}
	
	@Override
	public String toString() {
		return String.format("%d - %s (%s)", this.getId(), this.name, this.description);
	}
}
