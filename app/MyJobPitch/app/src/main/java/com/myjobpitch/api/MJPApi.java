package com.myjobpitch.api;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpAuthentication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.Login;
import com.myjobpitch.api.auth.Registration;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.Availability;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

public class MJPApi {

	private String apiRoot;
	private RestTemplate rest;
	private AuthToken token;
    private User user;
    private List<Sector> sectors;
    private List<Contract> contracts;
    private List<Hours> hours;
    private List<Availability> availabilities;
    private List<Sex> sexes;
    private List<Nationality> nationalities;
    private List<JobStatus> jobStatuses;
    private List<ApplicationStatus> applicationStatuses;
    private List<Role> roles;

    public MJPApi(String apiRoot) {
		this.token = null;
		this.apiRoot = apiRoot;
		this.rest = new RestTemplate();
		this.rest.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
	}
	
	public MJPApi() {
		this("http://mjp.digitalcrocodile.com:8000/");
	}

	private URI getListUrl(String path) {
		try {
			return new URI(apiRoot + "api/" + path + "/");
		} catch (URISyntaxException e) {
			e.printStackTrace();
			return null;
		}
	}

    private URI getObjectUrl(String path, Integer id) {
        try {
            return new URI(apiRoot + "api/" + path + "/" + id + "/");
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return null;
        }
    }

	private URI getAuthUrl(String path) {
		try {
			return new URI(apiRoot + "api-rest-auth/" + path + "/");
		} catch (URISyntaxException e) {
			e.printStackTrace();
			return null;
		}
	}

	private HttpEntity<Void> createAuthenticatedRequest() {
        if (token == null)
            throw new RuntimeException("Not logged in!");
        HttpHeaders headers = new HttpHeaders();
        headers.setAuthorization(new HttpAuthentication() {
            @Override
            public String getHeaderValue() {
                return "Token " + token.getKey();
            }
        });
        return new HttpEntity<>(null, headers);
	}

	public AuthToken login(String username, String password) {
        if (this.token != null)
            throw new RuntimeException("Already logged in!");
		Login login = new Login(username, password);
		this.token = rest.postForObject(getAuthUrl("login"), login, AuthToken.class);
		return this.token;
	}

    public boolean isAuthenticated() {
        return this.token != null;
    }

    public User register(String username, String email, String password1, String password2) throws MJPApiException {
        Registration registration = new Registration(username, email, password1, password2);
        try {
            return rest.postForObject(getAuthUrl("registration"), registration, User.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

	public void logout() {
        try {
            rest.exchange(getAuthUrl("logout"), HttpMethod.POST, createAuthenticatedRequest(), Object.class);
        } finally {
            this.token = null;
            this.user = null;
        }
	}

	public User getUser() {
        if (this.user == null) {
            URI url = getAuthUrl("user");
            this.user = rest.exchange(url, HttpMethod.GET, createAuthenticatedRequest(), User.class).getBody();
            this.user.setApi(this);
        }
        return this.user;
	}

	public List<Sector> getSectors() {
        if (this.sectors == null) {
            this.sectors = Arrays.asList(rest.exchange(getListUrl("sectors"), HttpMethod.GET, createAuthenticatedRequest(), Sector[].class).getBody());
            for (Sector sector : sectors)
                sector.setApi(this);
        }
        return this.sectors;
	}

	public List<Contract> getContracts() {
        if (this.contracts == null) {
            this.contracts = Arrays.asList(rest.exchange(getListUrl("contracts"), HttpMethod.GET, createAuthenticatedRequest(), Contract[].class).getBody());
            for (Contract contract : contracts)
                contract.setApi(this);
        }
        return this.contracts;
	}

	public List<Hours> getHours() {
        if (this.hours == null) {
            this.hours = Arrays.asList(rest.exchange(getListUrl("hours"), HttpMethod.GET, createAuthenticatedRequest(), Hours[].class).getBody());
            for (Hours h : hours)
                h.setApi(this);
        }
        return this.hours;
	}

	public List<Availability> getAvailabilities() {
		if (this.availabilities == null) {
            this.availabilities = Arrays.asList(rest.exchange(getListUrl("availabilities"), HttpMethod.GET, createAuthenticatedRequest(), Availability[].class).getBody());
            for (Availability availability : availabilities)
                availability.setApi(this);
        }
        return this.availabilities;
	}

	public List<Sex> getSexes() {
        if (this.sexes == null) {
            this.sexes = Arrays.asList(rest.exchange(getListUrl("sexes"), HttpMethod.GET, createAuthenticatedRequest(), Sex[].class).getBody());
            for (Sex sex : sexes)
                sex.setApi(this);
        }
        return sexes;
	}

	public List<Nationality> getNationalities() {
        if (this.nationalities == null) {
            this.nationalities = Arrays.asList(rest.exchange(getListUrl("nationalities"), HttpMethod.GET, createAuthenticatedRequest(), Nationality[].class).getBody());
            for (Nationality nationality : nationalities)
                nationality.setApi(this);
        }
        return this.nationalities;
	}

	public List<JobStatus> getJobStatuses() {
        if (this.jobStatuses == null) {
            this.jobStatuses = Arrays.asList(rest.exchange(getListUrl("job-statuses"), HttpMethod.GET, createAuthenticatedRequest(), JobStatus[].class).getBody());
            for (JobStatus jobStatus : jobStatuses)
                jobStatus.setApi(this);
        }
        return this.jobStatuses;
	}

	public List<ApplicationStatus> getApplicationStatuses() {
		if (this.applicationStatuses == null) {
            this.applicationStatuses = Arrays.asList(rest.exchange(getListUrl("application-statuses"), HttpMethod.GET, createAuthenticatedRequest(), ApplicationStatus[].class).getBody());
            for (ApplicationStatus applicationStatus : applicationStatuses)
                applicationStatus.setApi(this);
        }
        return this.applicationStatuses;
	}

	public List<Role> getRoles() {
        if (this.roles == null) {
            this.roles = Arrays.asList(rest.exchange(getListUrl("roles"), HttpMethod.GET, createAuthenticatedRequest(), Role[].class).getBody());
            for (Role role : roles)
                role.setApi(this);
        }
        return this.roles;
	}

    public JobSeeker getJobSeeker(Integer id) {
        return rest.exchange(getObjectUrl("job-seekers", id), HttpMethod.GET, createAuthenticatedRequest(), JobSeeker.class).getBody();
    }

    public Business getBusiness(Integer id) {
        return rest.exchange(getObjectUrl("businesses", id), HttpMethod.GET, createAuthenticatedRequest(), Business.class).getBody();
    }

    public Location getLocation(Integer id) {
        return rest.exchange(getObjectUrl("locations", id), HttpMethod.GET, createAuthenticatedRequest(), Location.class).getBody();
    }
}
