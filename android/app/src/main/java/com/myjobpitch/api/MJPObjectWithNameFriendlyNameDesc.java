package com.myjobpitch.api;

public class MJPObjectWithNameFriendlyNameDesc extends MJPObjectWithNameDesc {

	private String friendly_name;

	public String getFriendly_name() {
		return friendly_name;
	}

	@Override
	public String toString() {
		return String.format("%d - %s (%s): %s", this.getId(), this.getName(), this.friendly_name, this.getDescription());
	}

}
