package com.myjobpitch.api;

import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Availability;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

public class Test {

	public static void main(String[] args) {
		MJPApi api = new MJPApi();
		AuthToken token = api.login("admin", "admin");
		try {
			System.out.println("token: " + token.getKey());
			User user = api.getUser();
			System.out.println("Current user: " + user.getUsername());

			System.out.println("Sectors:");
			for (Sector sector : api.getSectors())
				System.out.println(sector);

			System.out.println("Contracts:");
			for (Contract contract : api.getContracts())
				System.out.println(contract);

			System.out.println("Hours:");
			for (Hours hours : api.getHours())
				System.out.println(hours);

			System.out.println("Availabilities:");
			for (Availability availability : api.getAvailabilities())
				System.out.println(availability);

			System.out.println("Sexes:");
			for (Sex sex : api.getSexes())
				System.out.println(sex);

			System.out.println("Nationalities:");
			for (Nationality nationality: api.getNationalities())
				System.out.println(nationality);

			System.out.println("Job Statuses:");
			for (JobStatus jobStatus: api.getJobStatuses())
				System.out.println(jobStatus);

			System.out.println("Application Statuses:");
			for (ApplicationStatus applicationStatus: api.getApplicationStatuses())
				System.out.println(applicationStatus);

			System.out.println("Roles:");
			for (Role role: api.getRoles())
				System.out.println(role);
			
		} finally {
			api.logout();
		}
	}
}
