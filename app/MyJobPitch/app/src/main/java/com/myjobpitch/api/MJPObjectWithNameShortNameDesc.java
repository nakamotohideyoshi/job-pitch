package com.myjobpitch.api;

public class MJPObjectWithNameShortNameDesc extends MJPAPIObject {
	private String name;
	private String short_name;
	private String description;

	public String getName() {
		return name;
	}
	
	public String getShort_name() {
		return short_name;
	}
	
	public String getDescription() {
		return description;
	}
	
	@Override
	public String toString() {
		return String.format("%d - %s (%s): %s", this.getId(), this.name, this.short_name, this.description);
	}
}
