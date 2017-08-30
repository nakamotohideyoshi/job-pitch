import axios from 'axios';
import * as utils from 'helpers/utils';
import cookie from 'js-cookie';

axios.defaults.baseURL = __LOCAL__ ? 'http://localhost:8080' : 'https://www.sclabs.co.uk';
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export default class ApiClient {

  /* utils */

  setToken = () => {
    if (__DEVELOPMENT__) {
      const token = cookie.get('token');
      if (token) {
        axios.defaults.headers.common.Authorization = `Token ${token}`;
      }
    } else {
      const token = cookie.get('csrftoken');
      if (token) {
        axios.defaults.headers.common['X-CSRFToken'] = token;
      }
    }
  };

  responseData = response => Promise.resolve(response.data);
  handleError = error => {
    const errors = error.response.status === 500 ? { detail: error.response.statusText } : error.response.data;
    if (typeof errors === 'string') {
      utils.errorNotif(errors);
    } else if (errors.detail) {
      utils.errorNotif(errors.detail);
    }
    return Promise.reject(error.response.status === 500 ? { detail: error.response.statusText } : error.response.data);
  }

  get = url => {
    this.setToken();
    return axios.get(url)
    .catch(this.handleError)
    .then(this.responseData);
  }
  post = (url, info) => {
    this.setToken();
    return axios.post(url, info)
    .catch(this.handleError)
    .then(this.responseData);
  }
  put = (url, info) => {
    this.setToken();
    return axios.put(url, info)
    .catch(this.handleError)
    .then(this.responseData);
  }
  delete = (url, info) => {
    this.setToken();
    return axios.delete(url, info)
    .catch(this.handleError)
    .then(this.responseData);
  }

  uploadImage = (endpoint, info, onUploadProgress) => {
    info.order = 0;
    this.setToken();
    return axios.post(
      `/api/${endpoint}/`,
      this.getFormData(info),
      { onUploadProgress }
    ).catch(this.handleError);
  };
  deleteImage = (endpoint, id) => {
    this.setToken();
    return axios.delete(`/api/${endpoint}/${id}/`)
    .catch(this.handleError);
  };


  getFormData = (data) => {
    const formData = new FormData();
    Object.keys(data).map(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, '');
      }
      return true;
    });
    return formData;
  }


  // auth api
  register = info => this.post('/api-rest-auth/registration/', info);
  login = info => this.post('/api-rest-auth/login/', info);
  reset = info => this.post('/api-rest-auth/password/reset/', info);
  changePassword = info => this.post('/api-rest-auth/password/change/', info);
  logout = () => this.post('/api-rest-auth/logout/');
  getUser = () => this.get('/api-rest-auth/user/');

  // static data
  getStaticData = () => {
    this.setToken();
    return axios.all([
      this.get('/api/initial-tokens/'),
      this.get('/api/sectors/'),
      this.get('/api/contracts/'),
      this.get('/api/hours/'),
      this.get('/api/nationalities/'),
      this.get('/api/application-statuses/'),
      this.get('/api/job-statuses/'),
      this.get('/api/sexes/'),
      this.get('/api/roles/'),
    ])
    .catch(this.handleError)
    .then(axios.spread((...data) => Promise.resolve(data)));
  }


  /* job seeker */
  getJobSeekers = query => this.get(`/api/job-seekers/${query}`);
  saveJobSeeker = jobSeeker => {
    const data = this.getFormData(jobSeeker);
    if (jobSeeker.id) {
      return this.put(`api/job-seekers/${jobSeeker.id}/`, data);
    }
    return this.post('/api/job-seekers/', data);
  }

  /* job profile */
  getJobProfile = profileId => this.get(`/api/job-profiles/${profileId}/`);
  saveJobProfile = profile => {
    if (profile.id) {
      return this.put(`api/job-profiles/${profile.id}/`, profile);
    }
    return this.post('/api/job-profiles/', profile);
  }


  /* user business */
  getUserBusinesses = (query) => this.get(`/api/user-businesses/${query}`);
  saveUserBusiness = business => {
    if (business.id) {
      return this.put(`/api/user-businesses/${business.id}/`, business);
    }
    return this.post('/api/user-businesses/', business);
  }
  deleteUserBusiness = businessId => this.delete(`/api/user-businesses/${businessId}/`);
  uploadBusinessLogo = (info, onUploadProgress) => this.uploadImage('user-business-images', info, onUploadProgress);
  deleteBusinessLogo = logoId => this.deleteImage('user-business-images', logoId);


  /* user workplace */
  getUserWorkPlaces = query => this.get(`/api/user-locations/${query}`);
  saveUserWorkPlace = workplace => {
    if (workplace.id) {
      return this.put(`/api/user-locations/${workplace.id}/`, workplace);
    }
    return this.post('/api/user-locations/', workplace);
  }
  deleteUserWorkPlace = workplaceId => this.delete(`/api/user-locations/${workplaceId}/`);
  uploadWorkPlaceLogo = (info, onUploadProgress) => this.uploadImage('user-location-images', info, onUploadProgress);
  deleteWorkPlaceLogo = logoId => this.deleteImage('user-location-images', logoId);


  /* user user job */
  getUserJobs = query => this.get(`/api/user-jobs/${query}`);
  saveUserJob = job => {
    if (job.id) {
      return this.put(`/api/user-jobs/${job.id}/`, job);
    }
    return this.post('/api/user-jobs/', job);
  }
  deleteUserJob = jobId => this.delete(`/api/user-jobs/${jobId}/`);
  uploadJobLogo = (info, onUploadProgress) => this.uploadImage('user-job-images', info, onUploadProgress);
  deleteJobLogo = logoId => this.deleteImage('user-job-images', logoId);

  getJobs = query => this.get(`/api/jobs/${query}`);


  /* application */
  getApplications = query => this.get(`/api/applications/${query}`);
  saveApplication = application => {
    if (application.id) {
      return this.put(`/api/applications/${application.id}/`, application);
    }
    return this.post('/api/applications/', application);
  }
  deleteApplication = appid => this.delete(`/api/applications/${appid}/`);

  /* message */
  sendMessage = message => this.post('/api/messages/', message);

  /* pitch */
  createPitch = () => this.post('/api/pitches/', {});
  getPitch = id => this.get(`/api/pitches/${id}/`);

}
