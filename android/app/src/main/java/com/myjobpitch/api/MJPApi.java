package com.myjobpitch.api;

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
import com.myjobpitch.api.data.BusinessUser;
import com.myjobpitch.api.data.BusinessUserForCreation;
import com.myjobpitch.api.data.BusinessUserForUpdate;
import com.myjobpitch.api.data.ChangePassword;
import com.myjobpitch.api.data.Contract;
import com.myjobpitch.api.data.Deprecation;
import com.myjobpitch.api.data.ExcludeJobSeeker;
import com.myjobpitch.api.data.ExternalApplication;
import com.myjobpitch.api.data.Hours;
import com.myjobpitch.api.data.ImageUpload;
import com.myjobpitch.api.data.InitialTokens;
import com.myjobpitch.api.data.Interview;
import com.myjobpitch.api.data.InterviewForCreation;
import com.myjobpitch.api.data.InterviewForUpdate;
import com.myjobpitch.api.data.Job;
import com.myjobpitch.api.data.JobPitchForCreation;
import com.myjobpitch.api.data.JobProfile;
import com.myjobpitch.api.data.JobSeeker;
import com.myjobpitch.api.data.JobSeekerForUpdate;
import com.myjobpitch.api.data.JobStatus;
import com.myjobpitch.api.data.Location;
import com.myjobpitch.api.data.MessageForCreation;
import com.myjobpitch.api.data.MessageForUpdate;
import com.myjobpitch.api.data.Nationality;
import com.myjobpitch.api.data.Pitch;
import com.myjobpitch.api.data.ProductToken;
import com.myjobpitch.api.data.PurchaseInfo;
import com.myjobpitch.api.data.Role;
import com.myjobpitch.api.data.Sector;
import com.myjobpitch.api.data.Sex;
import com.myjobpitch.api.data.SpecificPitchForCreation;
import com.myjobpitch.utils.AppData;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpAuthentication;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MJPApi {

    public static MJPApi instance;
    public static String apiUrl = "https://app.myjobpitch.com/";

    public static MJPApi shared() {
        if (instance == null) {
            instance = new MJPApi();
        }
        return instance;
    }

    private static final Map<Class<? extends MJPAPIObject>, String> classEndPoints = new HashMap<Class<? extends MJPAPIObject>, String>() {{
        put(JobProfile.class, "job-profiles");
        put(JobSeeker.class, "job-seekers");
        put(Pitch.class, "pitches");
        put(Job.class, "jobs");
        put(JobPitchForCreation.class, "job-videos");
        put(Location.class, "locations");
        put(Business.class, "businesses");
        put(Sector.class, "sectors");
        put(Contract.class, "contracts");
        put(Hours.class, "hours");
        put(Sex.class, "sexes");
        put(Nationality.class, "nationalities");
        put(JobStatus.class, "job-statuses");
        put(ApplicationStatus.class, "application-statuses");
        put(Role.class, "roles");
        put(Application.class, "applications");
        put(ApplicationForCreation.class, "applications");
        put(ApplicationShortlistUpdate.class, "applications");
        put(ApplicationStatusUpdate.class, "applications");
        put(MessageForCreation.class, "messages");
        put(MessageForUpdate.class, "messages");
        put(ProductToken.class, "google-play-products");
    }};

    private String apiRoot;
    private AuthToken token;
    private RestTemplate rest;

    public MJPApi(String apiRoot) {
        this.token = null;
        this.apiRoot = apiRoot;
        this.rest = new RestTemplate();
        this.rest.getMessageConverters().add(new MappingJackson2HttpMessageConverter());
        this.rest.getMessageConverters().add(new FormHttpMessageConverter());
    }

    public MJPApi() {
        this(apiUrl);
    }

    public String getApiRoot() {
        return apiRoot;
    }

    public void setToken(AuthToken token) {
        this.token = token;
    }

    public boolean isLogin() {
        return token != null;
    }

    public void clearToken() {
        token = null;
    }


    // ============================ get url ============================

    private URI getUrl(String path) {
        return getUrl(path, "");
    }

    private URI getUrl(String path, String query) {
        try {
            String url = apiRoot + "api/" + path + "/" + (query == null ||  query.isEmpty() ? "" : "?" + query);
            return new URI(url);
        } catch (URISyntaxException e) {
            e.printStackTrace();
            return null;
        }
    }

    private URI getUrl(String path, Integer id) {
        try {
            String url = apiRoot + "api/" + path + "/" + (id == null ? "" : id + "/");
            return new URI(url);
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


    // ============================ request ============================

    private HttpHeaders getDefaultHttpHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/json; version=" + AppData.API_VERSION);
        return headers;
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

    private <T> HttpEntity<T> createAuthenticatedRequest(T object) {
        return createAuthenticatedRequest(object, getDefaultHttpHeaders());
    }

    private HttpEntity<Void> createAuthenticatedRequest() {
        return createAuthenticatedRequest(null);
    }


    // ============================ method ============================

    private <T> T get(URI url, Class<T> responseType) {
        return rest.exchange(url, HttpMethod.GET, createAuthenticatedRequest(), responseType).getBody();
    }

    private <T> List<T> get(Class<T> cls, URI uri) {
        T[] dummyArray = (T[]) Array.newInstance(cls, 0);
        Class<T[]> arrayCls = (Class<T[]>) dummyArray.getClass();
        return Arrays.asList(get(uri, arrayCls));
    }

    private <T> T post(URI url, Object obj, Class<T> responseType) {
        return rest.exchange(url, HttpMethod.POST, createAuthenticatedRequest(obj), responseType).getBody();
//        return rest.postForObject(url, createAuthenticatedRequest(obj), responseType);
    }

    private <T> T put(URI url, Object obj, Class<T> responseType) {
        return rest.exchange(url, HttpMethod.PUT, createAuthenticatedRequest(obj), responseType).getBody();
    }

    private void delete(URI url) {
        rest.exchange(url, HttpMethod.DELETE, createAuthenticatedRequest(), Object.class);
    }


    public <T extends MJPAPIObject> T get(Class<T> cls, Integer id) {
        return get(getUrl(classEndPoints.get(cls), id), cls);
    }

    public <T extends MJPAPIObject> List<T> get(Class<T> cls) {
        return get(cls, getUrl(classEndPoints.get(cls)));
    }

    public <T extends  MJPAPIObject> List<T> get(Class<T> cls, String query) {
        return get(cls, getUrl(classEndPoints.get(cls), query));
    }

    public <T extends MJPAPIObject> T create(Class<T> cls, T obj) {
        return post(getUrl(classEndPoints.get(cls)), obj, cls);
    }

    public <T extends MJPAPIObject> T update(Class<T> cls, T obj) {
        return put(getUrl(classEndPoints.get(cls), obj.getId()), obj, cls);
    }

    public <T extends MJPAPIObject> void delete(Class<T> cls, Integer id) {
        delete(getUrl(classEndPoints.get(cls), id));
    }


    // ============================ api ============================

    public List<Deprecation> loadDeprecations() {
        return Arrays.asList(rest.getForObject(getUrl("deprecation"), Deprecation[].class));
    }

    public AuthToken login(Login object) {
        return rest.postForObject(getAuthUrl("login"), object, AuthToken.class);
    }

    public AuthToken register(Registration object) {
        return rest.postForObject(getAuthUrl("registration"), object, AuthToken.class);
    }

    public void resetPassword(ResetPassword object) {
        rest.postForObject(getAuthUrl("password/reset"), object, Object.class);
    }

    public void changePassword(ChangePassword object) {
        post(getAuthUrl("password/change"), object, Object.class);
    }

    public void logout() {
        post(getAuthUrl("logout"), null, Object.class);
    }

    public User getUser() {
        return get(getAuthUrl("user"), User.class);
    }

    public List<Business> getUserBusinesses() {
        return Arrays.asList(get(getUrl("user-businesses"), Business[].class));
    }

    public Business getUserBusiness(Integer id) {
        return get(getUrl("user-businesses", id), Business.class);
    }

    public InitialTokens getInitialTokens() {
        return get(getUrl("initial-tokens"), InitialTokens.class);
    }
    public Business createBusiness(Business business) {
        return post(getUrl("user-businesses"), business, Business.class);
    }

    public Business updateBusiness(Business business) {
        return put(getUrl("user-businesses", business.getId()), business, Business.class);
    }

    public void deleteBusiness(Integer id) {
        delete(getUrl("user-businesses", id));
    }

    public Location createLocation(Location location) {
        return post(getUrl("user-locations"), location, Location.class);
    }

    public Location updateLocation(Location location) {
        return put(getUrl("user-locations", location.getId()), location, Location.class);
    }

    public List<Location> getUserLocations(Integer business_id) {
        URI uri = getUrl("user-locations", business_id != null ? "business=" + business_id : null);
        return Arrays.asList(get(uri, Location[].class));
    }

    public Location getUserLocation(Integer id) {
        return get(getUrl("user-locations", id), Location.class);
    }

    public void deleteLocation(Integer id) {
        delete(getUrl("user-locations", id));
    }

    public List<Job> getUserJobs(Integer location_id) {
        URI uri = getUrl("user-jobs", location_id != null ? "location=" + location_id : null);
        return Arrays.asList(get(uri, Job[].class));
    }

    public Job getUserJob(Integer job_id) {
        return get(getUrl("user-jobs", job_id), Job.class);
    }

    public void updateApplicationShortlist(ApplicationShortlistUpdate update) {
        put(getUrl(classEndPoints.get(ApplicationShortlistUpdate.class), update.getId()), update, Object.class);
    }

    public void updateApplicationStatus(ApplicationStatusUpdate update) {
        put(getUrl(classEndPoints.get(ApplicationStatusUpdate.class), update.getId()), update, Object.class);
    }

    public Job createJob(Job job) {
        return post(getUrl("user-jobs"), job, Job.class);
    }

    public Job updateJob(Job job) {
        return put(getUrl("user-jobs", job.getId()), job, Job.class);
    }

    public void deleteJob(Integer id) {
        delete (getUrl("user-jobs", id));
    }

    public void uploadImage(String endpoint, String objectKey, ImageUpload image) {
        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        parts.put("image", Arrays.asList(new Object[] {image.getImage()}));
        parts.put(objectKey, Arrays.asList(new Object[] {image.getObject().toString()}));
        parts.put("order", Arrays.asList(new Object[]{image.getOrder().toString()}));

        HttpHeaders headers = getDefaultHttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = createAuthenticatedRequest(parts, headers);
        rest.postForObject(getUrl(endpoint), request, Object.class);
    }

    public void deleteBusinessImage(Integer id) {
        delete(getUrl("user-business-images", id));
    }

    public void deleteLocationImage(Integer id) {
        delete(getUrl("user-location-images", id));
    }

    public void deleteJobImage(Integer id) {
        delete(getUrl("user-job-images", id));
    }

    public JobSeeker updateJobSeeker(Integer jobSeekerId, JobSeekerForUpdate jobSeeker, Resource profileImage, Resource cv) {

        MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
        for (Field field : jobSeeker.getClass().getDeclaredFields()) {
            field.setAccessible(true);
            try {
                String name = field.getName();
                Object value = field.get(jobSeeker);
                if (!name.equals("pitches")) {
                    parts.put(name, Arrays.asList(new Object[] {value != null ? value.toString() : ""}));
                }
            } catch (Exception e) {
            }
        }
        if (profileImage != null) {
            parts.put("profile_image", Arrays.asList(new Object[] {profileImage}));
        }
        if (cv != null) {
            parts.put("cv", Arrays.asList(new Object[] {cv}));
        }

        HttpMethod method = jobSeekerId == null ? HttpMethod.POST : HttpMethod.PATCH;
        HttpHeaders headers = getDefaultHttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity request = createAuthenticatedRequest(parts, headers);
        return rest.exchange(getUrl("job-seekers", jobSeekerId), method, request, JobSeeker.class).getBody();
    }


    public List<BusinessUser> getBusinessUsers(Integer business_id) {
        return Arrays.asList(get(getUrl(String.format("user-businesses/%s/users", business_id)), BusinessUser[].class));
    }

    public BusinessUserForCreation createBusinessUser(BusinessUserForCreation businessUserForCreation, Integer business_id) {
        return post(getUrl(String.format("user-businesses/%s/users", business_id)), businessUserForCreation, BusinessUserForCreation.class);
    }

    public void reCreateBusinessUser(BusinessUserForCreation businessUserForCreation, Integer business_id, Integer user_id) {
        post(getUrl(String.format("user-businesses/%s/users/%s/resend-invitation", business_id, user_id)), businessUserForCreation, Object.class);
    }

    public BusinessUser getBusinessUser(Integer businessId, Integer userId) {
        return get(getUrl(String.format("user-businesses/%s/users/%s", businessId, userId)), BusinessUser.class);
    }

    public BusinessUserForUpdate updateBusinessUser(BusinessUserForUpdate businessUserForUpdate, Integer business_id, Integer user_id) {
        return put(getUrl(String.format("user-businesses/%s/users/%s", business_id, user_id)), businessUserForUpdate, BusinessUserForUpdate.class);
    }

    public void deleteBusinessUser(Integer business_id, Integer user_id) {
        delete(getUrl(String.format("user-businesses/%s/users/%s", business_id, user_id)));
    }

    public Interview getInterview(Integer interviewId) {
        return get(getUrl(String.format("interviews/%s", interviewId)), Interview.class);
    }

    public InterviewForCreation createInterview(InterviewForCreation interviewForCreation) {
        return post(getUrl("interviews"), interviewForCreation, InterviewForCreation.class);
    }

    public InterviewForUpdate updateInterview(InterviewForUpdate interviewForUpdate, Integer interviewId) {
        return put(getUrl(String.format("interviews/%s", interviewId)), interviewForUpdate, InterviewForUpdate.class);
    }

    public void deleteInterview(Integer interviewId) {
        delete(getUrl("interviews", interviewId));
    }

    public void completeInterview(InterviewForUpdate interviewForUpdate, Integer interviewId) {
        post(getUrl(String.format("interviews/%s/complete", interviewId)), interviewForUpdate, Object.class);
    }

    public void acceptInterview(Integer interviewId) {
        post(getUrl(String.format("interviews/%s/accept", interviewId)), null, Object.class);
    }

    public void addExternalApplication(ExternalApplication externalApplication) {
        post(getUrl("applications/external"), externalApplication, Object.class);
    }

    public void excludeJobSeeker(ExcludeJobSeeker data) {
        post(getUrl(String.format("user-jobs/%s/exclude", data.getJob())), data, Object.class);
    }

    public Business sendPurchaseInfo(Integer businessId, String productId, String purchaseToken) {
        PurchaseInfo purchaseInfo = new PurchaseInfo(businessId, productId, purchaseToken);
        return post(getUrl("android/purchase"), purchaseInfo, Business.class);
    }

    public Pitch createJobPitch(JobPitchForCreation obj) {
        return post(getUrl("job-videos"), obj, Pitch.class);
    }

    public Pitch createSpecificPitch(SpecificPitchForCreation obj) {
        return post(getUrl("application-pitches"), obj, Pitch.class);
    }

    public Pitch getPitch(Integer pitchId, String endpoint) {
        return get(getUrl(endpoint, pitchId), Pitch.class);
    }
}
