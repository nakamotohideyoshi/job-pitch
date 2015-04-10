package com.myjobpitch.api;

import android.util.Log;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.List;

import org.springframework.http.HttpAuthentication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
import com.myjobpitch.api.data.Job;
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

    private URI getTypeUrl(String path) {
        return getTypeUrl(path, null);
    }

	private URI getTypeUrl(String path, String query) {
		try {
            if (query != null)
                return new URI(apiRoot + "api/" + path + "/?" + query);
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

	private <T> HttpEntity<T> createAuthenticatedRequest(T object) {
        if (token == null)
            throw new RuntimeException("Not logged in!");
        HttpHeaders headers = new HttpHeaders();
        headers.setAuthorization(new HttpAuthentication() {
            @Override
            public String getHeaderValue() {
                return "Token " + token.getKey();
            }
        });
        return new HttpEntity<>(object, headers);
	}

    private HttpEntity<Void> createAuthenticatedRequest() {
        return createAuthenticatedRequest((Void)null);
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

    public User register(String username, String password1, String password2) throws MJPApiException {
        Registration registration = new Registration(username, password1, password2);
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
            Log.d("API", "Logging out");
            rest.exchange(getAuthUrl("logout"), HttpMethod.POST, createAuthenticatedRequest(), Object.class);
        } finally {
            this.token = null;
            this.user = null;
        }
	}

	public User getUser() {
        if (this.user == null)
            this.user = rest.exchange(getAuthUrl("user"), HttpMethod.GET, createAuthenticatedRequest(), User.class).getBody();
        return this.user;
	}

	public List<Sector> getSectors() {
        if (this.sectors == null)
            this.sectors = Arrays.asList(rest.exchange(getTypeUrl("sectors"), HttpMethod.GET, createAuthenticatedRequest(), Sector[].class).getBody());
        return this.sectors;
	}

	public List<Contract> getContracts() {
        if (this.contracts == null)
            this.contracts = Arrays.asList(rest.exchange(getTypeUrl("contracts"), HttpMethod.GET, createAuthenticatedRequest(), Contract[].class).getBody());
        return this.contracts;
	}

	public List<Hours> getHours() {
        if (this.hours == null)
            this.hours = Arrays.asList(rest.exchange(getTypeUrl("hours"), HttpMethod.GET, createAuthenticatedRequest(), Hours[].class).getBody());
        return this.hours;
	}

	public List<Availability> getAvailabilities() {
		if (this.availabilities == null)
            this.availabilities = Arrays.asList(rest.exchange(getTypeUrl("availabilities"), HttpMethod.GET, createAuthenticatedRequest(), Availability[].class).getBody());
        return this.availabilities;
	}

	public List<Sex> getSexes() {
        if (this.sexes == null)
            this.sexes = Arrays.asList(rest.exchange(getTypeUrl("sexes"), HttpMethod.GET, createAuthenticatedRequest(), Sex[].class).getBody());
        return sexes;
	}

	public List<Nationality> getNationalities() {
        if (this.nationalities == null)
            this.nationalities = Arrays.asList(rest.exchange(getTypeUrl("nationalities"), HttpMethod.GET, createAuthenticatedRequest(), Nationality[].class).getBody());
        return this.nationalities;
	}

	public List<JobStatus> getJobStatuses() {
        if (this.jobStatuses == null)
            this.jobStatuses = Arrays.asList(rest.exchange(getTypeUrl("job-statuses"), HttpMethod.GET, createAuthenticatedRequest(), JobStatus[].class).getBody());
        return this.jobStatuses;
	}

	public List<ApplicationStatus> getApplicationStatuses() {
		if (this.applicationStatuses == null)
            this.applicationStatuses = Arrays.asList(rest.exchange(getTypeUrl("application-statuses"), HttpMethod.GET, createAuthenticatedRequest(), ApplicationStatus[].class).getBody());
        return this.applicationStatuses;
	}

	public List<Role> getRoles() {
        if (this.roles == null)
            this.roles = Arrays.asList(rest.exchange(getTypeUrl("roles"), HttpMethod.GET, createAuthenticatedRequest(), Role[].class).getBody());
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

    public void deleteBusiness(Integer id) {
        rest.exchange(getObjectUrl("user-businesses", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public List<Business> getUserBusinesses() {
        return Arrays.asList(rest.exchange(getTypeUrl("user-businesses"), HttpMethod.GET, createAuthenticatedRequest(), Business[].class).getBody());
    }

    public Business getUserBusiness(Integer id) {
        return rest.exchange(getObjectUrl("user-businesses", id), HttpMethod.GET, createAuthenticatedRequest(), Business.class).getBody();
    }

    public Business createBusiness(Business business) throws MJPApiException {
        try {
            return rest.exchange(getTypeUrl("user-businesses"), HttpMethod.POST, createAuthenticatedRequest(business), Business.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public Business updateBusiness(Business business) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl("user-businesses", business.getId()), HttpMethod.PUT, createAuthenticatedRequest(business), Business.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public void deleteLocation(Integer id) {
        rest.exchange(getObjectUrl("user-locations", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public Location createLocation(Location location) throws MJPApiException {
        try {
            return rest.exchange(getTypeUrl("user-locations"), HttpMethod.POST, createAuthenticatedRequest(location), Location.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public Location updateLocation(Location location) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl("user-locations", location.getId()), HttpMethod.PUT, createAuthenticatedRequest(location), Location.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public List<Location> getUserLocations(Integer business_id) {
        return Arrays.asList(rest.exchange(getTypeUrl("user-locations", String.format("business=%s", business_id)), HttpMethod.GET, createAuthenticatedRequest(), Location[].class).getBody());
    }

    public List<Job> getUserJobs(Integer location_id) {
        return Arrays.asList(rest.exchange(getTypeUrl("user-jobs", String.format("location=%s", location_id)), HttpMethod.GET, createAuthenticatedRequest(), Job[].class).getBody());
    }

    public void deleteJob(Integer id) {
        rest.exchange(getObjectUrl("user-jobs", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public Job getJob(Integer id) {
        return rest.exchange(getObjectUrl("jobs", id), HttpMethod.GET, createAuthenticatedRequest(), Job.class).getBody();
    }

    public Job createJob(Job job) throws MJPApiException {
        try {
            return rest.exchange(getTypeUrl("user-jobs"), HttpMethod.POST, createAuthenticatedRequest(job), Job.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public Job updateJob(Job job) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl("user-jobs", job.getId()), HttpMethod.PUT, createAuthenticatedRequest(job), Job.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public JobSeeker createJobSeeker(JobSeeker jobSeeker) throws MJPApiException {
        try {
            return rest.exchange(getTypeUrl("job-seekers"), HttpMethod.POST, createAuthenticatedRequest(jobSeeker), JobSeeker.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public JobSeeker updateJobSeeker(JobSeeker jobSeeker) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl("job-seekers", jobSeeker.getId()), HttpMethod.PUT, createAuthenticatedRequest(jobSeeker), JobSeeker.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public User updateUser(User user) {
        this.user = rest.exchange(getAuthUrl("user"), HttpMethod.PUT, createAuthenticatedRequest(user), User.class).getBody();
        return user;
    }

    public List<JobSeeker> getJobSeekers(Integer job_id) {
        return Arrays.asList(rest.exchange(getTypeUrl("job-seekers", String.format("job=%s", job_id)), HttpMethod.GET, createAuthenticatedRequest(), JobSeeker[].class).getBody());
    }
}
