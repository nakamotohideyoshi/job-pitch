package com.myjobpitch.api;

public class MJPObjectWithNameShortNameDesc extends MJPObjectWithNameDesc {
	private String short_name;

	public String getShort_name() {
		return short_name;
	}

	@Override
	public String toString() {
		return String.format("%d - %s (%s): %s", this.getId(), this.getName(), this.short_name, this.getDescription());
	}
}
