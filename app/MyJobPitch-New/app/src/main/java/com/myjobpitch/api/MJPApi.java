package com.myjobpitch.api;

import android.util.Log;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.myjobpitch.api.auth.AuthToken;
import com.myjobpitch.api.auth.Login;
import com.myjobpitch.api.auth.Registration;
import com.myjobpitch.api.auth.ResetPassword;
import com.myjobpitch.api.auth.User;
import com.myjobpitch.api.data.Application;
import com.myjobpitch.api.data.ApplicationForCreation;
import com.myjobpitch.api.data.ApplicationShortlistUpdate;
import com.myjobpitch.api.data.ApplicationStatus;
import com.myjobpitch.api.data.ApplicationStatusUpdate;
import com.myjobpitch.api.data.Business;
import com.myjobpitch.api.data.ChangePassword;
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
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.PurchaseInfo;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;

import org.springframework.http.HttpAuthentication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.ResourceHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Array;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MJPApi {

    private static MJPApi instance;
    public static MJPApi shared() {
        if (instance == null) {
            instance = new MJPApi();
        }
        return instance;
    }

    private static final Map<Class<? extends MJPAPIObject>, String> classEndPoints;
    static {
        classEndPoints = new HashMap<>();
        classEndPoints.put(JobProfile.class, "job-profiles");
        classEndPoints.put(JobSeeker.class, "job-seekers");
        classEndPoints.put(Pitch.class, "pitches");
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
        classEndPoints.put(ApplicationShortlistUpdate.class, "applications");
        classEndPoints.put(ApplicationStatusUpdate.class, "applications");
        classEndPoints.put(MessageForCreation.class, "messages");
        classEndPoints.put(MessageForUpdate.class, "messages");
    }

    private String apiRoot;
	private RestTemplate rest;
    private RestTemplate unbufferedRest;
	private AuthToken token;
//    private User user;

    public MJPApi(String apiRoot) {
		this.token = null;
		this.apiRoot = apiRoot;
        this.rest = new RestTemplate();
        this.rest.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.rest.getMessageConverters().add(new FormHttpMessageConverter());

        this.unbufferedRest = new RestTemplate();
        SimpleClientHttpRequestFactory unbufferedFactory = new SimpleClientHttpRequestFactory();
        unbufferedFactory.setBufferRequestBody(false);
        this.unbufferedRest.setRequestFactory(unbufferedFactory);
        this.unbufferedRest.getMessageConverters().add(new ResourceHttpMessageConverter());
        this.unbufferedRest.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
	}

	public MJPApi() {
		this("https://www.sclabs.co.uk/");
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
        return createAuthenticatedRequest((Void) null);
    }

    public boolean isAuthenticated() {
        return this.token != null;
    }

    public AuthToken login(String email, String password) throws MJPApiException {
        Login login = new Login(email, password);
        URI url = getAuthUrl("login");
        return doAuthentication(login, url);
    }

    public AuthToken register(String email, String password1, String password2) throws MJPApiException {
        Registration registration = new Registration(email, password1, password2);
        URI url = getAuthUrl("registration");
        return doAuthentication(registration, url);
    }

    public void resetPassword(String email) throws MJPApiException {
        ResetPassword resetpassword = new ResetPassword(email);
        URI url = getAuthUrl("password/reset");
        try {
            rest.postForObject(url, resetpassword, Object.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public void changePassword(String password1, String password2) throws MJPApiException {
        ChangePassword changepassword = new ChangePassword(password1, password2);

        try {
            rest.exchange(getAuthUrl("password/change"), HttpMethod.POST, createAuthenticatedRequest(changepassword), Object.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    private AuthToken doAuthentication(Object credentials, URI url) throws MJPApiException {
        if (this.token != null) {
            Log.e("MJPApi", "Already logged in!");
            token = null;
//            this.user = null;
        }
        try {
            token = rest.postForObject(url, credentials, AuthToken.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
        return token;
    }

    public void logout() {
        try {
            Log.d("API", "Logging out");
            rest.exchange(getAuthUrl("logout"), HttpMethod.POST, createAuthenticatedRequest(), Object.class);
        } catch (Exception e){
            Log.e("API", "Couldn't contact server to log out", e);
        } finally {
            this.token = null;
//            this.user = null;
        }
	}

	public User getUser() throws MJPApiException {
        try {
            return rest.exchange(getAuthUrl("user"), HttpMethod.GET, createAuthenticatedRequest(), User.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
	}

    public User updateUser(User user) {
        return rest.exchange(getAuthUrl("user"), HttpMethod.PUT, createAuthenticatedRequest(user), User.class).getBody();
    }

    public List<Business> getUserBusinesses() throws MJPApiException {
        return Arrays.asList(rest.exchange(getTypeUrl("user-businesses"), HttpMethod.GET, createAuthenticatedRequest(), Business[].class).getBody());
    }

    public Business getUserBusiness(Integer id) throws MJPApiException {
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

    public void deleteBusiness(Integer id) throws MJPApiException {
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

    public List<Location> getUserLocations(Integer business_id) throws MJPApiException {
        return Arrays.asList(rest.exchange(getTypeUrl("user-locations", String.format("business=%s", business_id)), HttpMethod.GET, createAuthenticatedRequest(), Location[].class).getBody());
    }

    public Location getUserLocation(Integer id) throws MJPApiException {
        return rest.exchange(getObjectUrl("user-locations", id), HttpMethod.GET, createAuthenticatedRequest(), Location.class).getBody();
    }

    public void deleteLocation(Integer id) throws MJPApiException {
        rest.exchange(getObjectUrl("user-locations", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public List<Job> getUserJobs(Integer location_id) throws MJPApiException {
        URI uri = getTypeUrl("user-jobs", location_id != null ? String.format("location=%s", location_id) : null);
        return Arrays.asList(rest.exchange(uri, HttpMethod.GET, createAuthenticatedRequest(), Job[].class).getBody());
    }

    public Job getUserJob(Integer job_id) throws MJPApiException {
        return rest.exchange(getObjectUrl("user-jobs", job_id), HttpMethod.GET, createAuthenticatedRequest(), Job.class).getBody();
    }

    public void updateApplicationShortlist(ApplicationShortlistUpdate update) throws MJPApiException {
        try {
            rest.exchange(getObjectUrl(classEndPoints.get(ApplicationShortlistUpdate.class), update.getId()), HttpMethod.PUT, createAuthenticatedRequest(update), ApplicationShortlistUpdate.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public void updateApplicationStatus(ApplicationStatusUpdate update) throws MJPApiException {
        try {
            rest.exchange(getObjectUrl(classEndPoints.get(ApplicationStatusUpdate.class), update.getId()), HttpMethod.PUT, createAuthenticatedRequest(update), ApplicationStatusUpdate.class);
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

    public void deleteJob(Integer id) throws MJPApiException {
        rest.exchange(getObjectUrl("user-jobs", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public void uploadImage(String endpoint, String objectKey, ImageUpload image) throws MJPApiException {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
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

    public void deleteBusinessImage(Integer id) {
        rest.exchange(getObjectUrl("user-business-images", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public void deleteLocationImage(Integer id) {
        rest.exchange(getObjectUrl("user-location-images", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public void deleteJobImage(Integer id) {
        rest.exchange(getObjectUrl("user-job-images", id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
    }

    public JobSeeker updateJobSeeker(JobSeeker jobSeeker) throws MJPApiException {

//        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
//        parts.add("first_name", jobSeeker.getFirst_name());
//        parts.add("last_name", jobSeeker.getLast_name());
//        parts.add("email_public", jobSeeker.getEmail_public());
//        parts.add("telephone", jobSeeker.getTelephone());
//        parts.add("telephone_public", jobSeeker.getTelephone_public());
//        parts.add("mobile", jobSeeker.getMobile());
//        parts.add("mobile_public", jobSeeker.getMobile_public());
//        parts.add("age", jobSeeker.getAge());
//        parts.add("age_public", jobSeeker.getAge_public());
//        parts.add("sex_public", jobSeeker.getSex_public());
//        parts.add("nationality_public", jobSeeker.getNationality_public());
//        parts.add("description", jobSeeker.getDescription());
//        parts.add("active", jobSeeker.isActive());
//        parts.add("has_references", jobSeeker.getHasReferences());
//        parts.add("first_name", jobSeeker.getFirst_name());
//
//        try {
//            HttpHeaders headers = new HttpHeaders();
//            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
//            HttpEntity<MultiValueMap<String, Object>> request = createAuthenticatedRequest(parts, headers);
//            return rest.exchange(getObjectUrl("job-seekers", jobSeeker.getId()), HttpMethod.PUT, request, JobSeeker.class).getBody();
//        } catch (HttpClientErrorException e) {
//            if (e.getStatusCode().value() == 400) {
//                throw new MJPApiException(e);
//            }
//            throw e;
//        }

        jobSeeker.setCV(null);
        try {
            return rest.exchange(getObjectUrl("job-seekers", jobSeeker.getId()), HttpMethod.PUT, createAuthenticatedRequest(jobSeeker), JobSeeker.class).getBody();
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public Business sendPurchaseInfo(Integer businessId, String productId, String purchaseToken) throws MJPApiException {
        PurchaseInfo purchaseInfo = new PurchaseInfo(businessId, productId, purchaseToken);

        try {
            return rest.exchange(getTypeUrl("android/purchase"), HttpMethod.POST, createAuthenticatedRequest(purchaseInfo), Business.class).getBody();
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
            if (e.getStatusCode().value() == 400)
                throw new MJPApiException(e);
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

    public <T extends MJPAPIObject> void delete(Class<T> cls, Integer id) throws MJPApiException {
        try {
            rest.exchange(getObjectUrl(classEndPoints.get(cls), id), HttpMethod.DELETE, createAuthenticatedRequest(), Void.class);
        } catch (HttpClientErrorException e) {
            if (e.getStatusCode().value() == 400) {
                throw new MJPApiException(e);
            }
            throw e;
        }
    }

    public String getApiRoot() {
        return apiRoot;
    }

    public void setApiRoot(String apiRoot) {
        this.apiRoot = apiRoot;
    }

    public boolean isLogin() {
        return token != null;
    }
    public void clearToken() {
        token = null;
    }
}
