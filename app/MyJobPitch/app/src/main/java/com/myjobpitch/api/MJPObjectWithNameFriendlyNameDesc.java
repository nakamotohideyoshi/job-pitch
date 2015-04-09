package com.myjobpitch.api;

public class MJPObjectWithNameFriendlyNameDesc extends MJPAPIObject {
	private String name;
	private String friendly_name;
	private String description;

	public String getName() {
		return name;
	}
	
	public String getFriendly_name() {
		return friendly_name;
	}
	
	public String getDescription() {
		return description;
	}
	
	@Override
	public String toString() {
		return String.format("%d - %s (%s): %s", this.getId(), this.name, this.friendly_name, this.description);
	}
}
