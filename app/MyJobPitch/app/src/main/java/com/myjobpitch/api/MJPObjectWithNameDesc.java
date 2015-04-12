package com.myjobpitch.api;

public class MJPObjectWithNameDesc extends MJPObjectWithName {
    private String description;

    public String getDescription() {
		return description;
	}
	
	@Override
	public String toString() {
		return String.format("%d - %s (%s)", this.getId(), this.getName(), this.description);
	}
}
