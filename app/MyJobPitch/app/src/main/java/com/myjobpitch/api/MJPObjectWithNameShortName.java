package com.myjobpitch.api;

public class MJPObjectWithNameShortName extends MJPAPIObject {
	private String name;
	private String short_name;

	public String getName() {
		return name;
	}
	
	public String getShort_name() {
		return short_name;
	}

	@Override
	public String toString() {
		return String.format("%d - %s (%s)", this.getId(), this.name, this.short_name);
	}
}
