package com.myjobpitch.api;

public class MJPObjectWithNameDesc extends MJPAPIObject {
	private int id; 
	private String name;
	private String description;
	
	public int getId() {
		return id;
	}
	
	public String getName() {
		return this.name;
	}
	
	public String getDescription() {
		return description;
	}
	
	@Override
	public String toString() {
		return String.format("%d - %s (%s)", this.id, this.name, this.description);
	}
}
