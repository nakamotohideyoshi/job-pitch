package com.myjobpitch.api;

import android.util.Log;

import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.Login;
import com.myjobpitch.api.auth.Registration;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationUpdate;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.ImageUpload;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.api.data.MessageForUpdate;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import org.springframework.http.HttpAuthentication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Array;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MJPApi {
    private static final Map<Class<? extends MJPAPIObject>, String> classEndPoints;
    static {
        classEndPoints = new HashMap<>();
        classEndPoints.put(JobProfile.class, "job-profiles");
        classEndPoints.put(JobSeeker.class, "job-seekers");
        classEndPoints.put(Job.class, "jobs");
        classEndPoints.put(Location.class, "locations");
        classEndPoints.put(Business.class, "businesses");
        classEndPoints.put(Sector.class, "sectors");
        classEndPoints.put(Contract.class, "contracts");
        classEndPoints.put(Hours.class, "hours");
        classEndPoints.put(Sex.class, "sexes");
        classEndPoints.put(Nationality.class, "nationalities");
        classEndPoints.put(JobStatus.class, "job-statuses");
        classEndPoints.put(ApplicationStatus.class, "application-statuses");
        classEndPoints.put(Role.class, "roles");
        classEndPoints.put(Application.class, "applications");
        classEndPoints.put(ApplicationForCreation.class, "applications");
        classEndPoints.put(ApplicationUpdate.class, "applications");
        classEndPoints.put(MessageForCreation.class, "messages");
        classEndPoints.put(MessageForUpdate.class, "messages");
    }

	private String apiRoot;
	private RestTemplate rest;
	private AuthToken token;
    private User user;

    public MJPApi(String apiRoot) {
		this.token = null;
		this.apiRoot = apiRoot;
		this.rest = new RestTemplate();
		this.rest.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.rest.getMessageConverters().add(new FormHttpMessageConverter());
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
        return createAuthenticatedRequest(object, new HttpHeaders());
    }

    private <T> HttpEntity<T> createAuthenticatedRequest(T object, HttpHeaders headers) {
        if (token == null)
            throw new RuntimeException("Not logged in!");

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
        this.token = null;
        this.user = null;
        try {
            Log.d("API", "Logging out");
            rest.exchange(getAuthUrl("logout"), HttpMethod.POST, createAuthenticatedRequest(), Object.class);
        } catch (Exception e){
            Log.e("API", "Couldn't contact server to log out", e);
        }
	}

	public User getUser() {
        if (this.user == null)
            this.user = rest.exchange(getAuthUrl("user"), HttpMethod.GET, createAuthenticatedRequest(), User.class).getBody();
        return this.user;
	}

    public User updateUser(User user) {
        this.user = rest.exchange(getAuthUrl("user"), HttpMethod.PUT, createAuthenticatedRequest(user), User.class).getBody();
        return user;
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

    public void deleteBusiness(Integer id) {
        rest.exchange(getObjectUrl("user-businesses", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
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

    public void deleteLocation(Integer id) {
        rest.exchange(getObjectUrl("user-locations", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public List<Job> getUserJobs(Integer location_id) {
        return Arrays.asList(rest.exchange(getTypeUrl("user-jobs", String.format("location=%s", location_id)), HttpMethod.GET, createAuthenticatedRequest(), Job[].class).getBody());
    }

    public Job getUserJob(Integer job_id) {
        return rest.exchange(getObjectUrl("user-jobs", job_id), HttpMethod.GET, createAuthenticatedRequest(), Job.class).getBody();
    }

    public void updateApplication(ApplicationUpdate update) throws MJPApiException {
        try {
            rest.exchange(getObjectUrl(classEndPoints.get(ApplicationUpdate.class), update.getId()), HttpMethod.PUT, createAuthenticatedRequest(update), ApplicationUpdate.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
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

    public void deleteJob(Integer id) {
        rest.exchange(getObjectUrl("user-jobs", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public void uploadImage(String endpoint, String objectKey, ImageUpload image) throws MJPApiException {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<String, Object>();
        parts.put("image", Arrays.asList(new Object[] {image.getImage()}));
        parts.put(objectKey, Arrays.asList(new Object[] {image.getObject().toString()}));
        parts.put("order", Arrays.asList(new Object[]{image.getOrder().toString()}));

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<MultiValueMap<String, Object>> request = createAuthenticatedRequest(parts, headers);
            rest.postForObject(getTypeUrl(endpoint), request, Object.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public <T extends MJPAPIObject> List<T> get(Class<T> cls) throws MJPApiException {
        return get(cls, getTypeUrl(classEndPoints.get(cls)));
    }

    public <T extends MJPAPIObject> List<T> get(Class<T> cls, String query) throws MJPApiException {
        return get(cls, getTypeUrl(classEndPoints.get(cls), query));
    }

    private <T extends MJPAPIObject> List<T> get(Class<T> cls, URI uri) throws MJPApiException {
        T[] dummyArray = (T[]) Array.newInstance(cls, 0);
        Class<T[]> arrayCls = (Class<T[]>) dummyArray.getClass();
        try {
            return Arrays.asList(rest.exchange(uri, HttpMethod.GET, createAuthenticatedRequest(), arrayCls).getBody());
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public <T extends MJPAPIObject> T get(Class<T> cls, Integer id) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl(classEndPoints.get(cls), id), HttpMethod.GET, createAuthenticatedRequest(), cls).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public <T extends MJPAPIObject> T create(Class<T> cls, T obj) throws MJPApiException {
        try {
            return rest.exchange(getTypeUrl(classEndPoints.get(cls)), HttpMethod.POST, createAuthenticatedRequest(obj), cls).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public <T extends MJPAPIObject> T update(Class<T> cls, T obj) throws MJPApiException {
        try {
            return rest.exchange(getObjectUrl(classEndPoints.get(cls), obj.getId()), HttpMethod.PUT, createAuthenticatedRequest(obj), cls).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }
}
