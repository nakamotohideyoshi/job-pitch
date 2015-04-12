package com.myjobpitch.api;

public class MJPObjectWithNameShortName extends MJPObjectWithName {
	private String short_name;

	public String getShort_name() {
		return short_name;
	}

	@Override
	public String toString() {
		return String.format("%d - %s (%s)", this.getId(), this.getName(), this.short_name);
	}
}
