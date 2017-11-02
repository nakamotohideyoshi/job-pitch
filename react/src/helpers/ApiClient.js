import axios from 'axios';
import * as utils from 'helpers/utils';

if (__LOCAL__ && __DEVELOPMENT__) {
  axios.defaults.baseURL = 'http://192.168.1.49:8080';
}
axios.defaults.headers.common.Accept = 'application/json';
axios.defaults.headers.post['Content-Type'] = 'application/json';

export default class ApiClient {

  static instance;
  static shared() {
    return ApiClient.instance;
  }

  constructor() {
    ApiClient.instance = this;
  }

  isLoggedIn = () => !!utils.getCookie(__DEVELOPMENT__ ? 'token' : 'csrftoken')

  setToken = () => {
    if (__DEVELOPMENT__) {
      const token = utils.getCookie('token');
      if (token) {
        axios.defaults.headers.common.Authorization = `Token ${token}`;
      }
    } else {
      const token = utils.getCookie('csrftoken');
      if (token) {
        axios.defaults.headers.common['X-CSRFToken'] = token;
      }
    }
  };

  responseData = response => Promise.resolve(response.data);
  handleError = error => {
    if (!error.response) {
      return Promise.reject({ detail: 'Network Error' });
    }

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
    .then(this.responseData, this.handleError);
  }
  post = (url, info) => {
    this.setToken();
    return axios.post(url, info)
    .then(this.responseData, this.handleError);
  }
  put = (url, info) => {
    this.setToken();
    return axios.put(url, info)
    .then(this.responseData, this.handleError);
  }
  delete = (url, info) => {
    this.setToken();
    return axios.delete(url, info)
    .then(this.responseData, this.handleError);
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
  login = info => this.post('/api-rest-auth/login/', info).then(
    data => {
      if (__DEVELOPMENT__) {
        utils.setCookie('token', data.key);
      }
    }
  );
  logout = () => this.post('/api-rest-auth/logout/').then(
    () => {
      if (__DEVELOPMENT__) {
        utils.setCookie('token');
      } else {
        utils.setCookie('csrftoken');
      }
      this.user = null;
      this.jobSeeker = null;
      this.initialTokens = null;
      this.sectors = null;
      this.contracts = null;
      this.hours = null;
      this.nationalities = null;
      this.applicationStatuses = null;
      this.jobStatuses = null;
      this.sexes = null;
      this.roles = null;
      this.products = null;
    }
  );
  reset = info => this.post('/api-rest-auth/password/reset/', info);
  changePassword = info => this.post('/api-rest-auth/password/change/', info);

  // api data

  getUser = () => this.get('/api-rest-auth/user/').then(
    data => {
      this.user = data;
      return Promise.resolve(data);
    }
  );

  loadData = () => axios.all([
    this.get('/api/initial-tokens/'),
    this.get('/api/sectors/'),
    this.get('/api/contracts/'),
    this.get('/api/hours/'),
    this.get('/api/nationalities/'),
    this.get('/api/application-statuses/'),
    this.get('/api/job-statuses/'),
    this.get('/api/sexes/'),
    this.get('/api/roles/'),
    this.get('/api/paypal-products/'),
  ]).then(
    axios.spread((...data) => {
      this.initialTokens = data[0];
      this.sectors = data[1];
      this.contracts = data[2];
      this.hours = data[3];
      this.nationalities = data[4];
      this.applicationStatuses = data[5];
      this.jobStatuses = data[6];
      this.sexes = data[7];
      this.roles = data[8];
      if (__DEVELOPMENT__) {
        this.products = utils.getTempProducts();
      } else {
        this.products = data[9];
      }
    }),
    this.handleError
  );

  /* job seeker */

  getJobSeekers = query => this.get(`/api/job-seekers/${query}`);
  saveJobSeeker = jobSeeker => {
    const data = this.getFormData(jobSeeker);
    if (jobSeeker.id) {
      return this.put(`/api/job-seekers/${jobSeeker.id}/`, data);
    }
    return this.post('/api/job-seekers/', data);
  }

  /* job profile */

  getJobProfile = profileId => this.get(`/api/job-profiles/${profileId}/`);
  saveJobProfile = profile => {
    if (profile.id) {
      return this.put(`/api/job-profiles/${profile.id}/`, profile);
    }
    return this.post('/api/job-profiles/', profile);
  }


  /* user business */
  getUserBusinesses = query => this.get(`/api/user-businesses/${query}`);
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
  getUserWorkplaces = query => this.get(`/api/user-locations/${query}`);
  saveUserWorkplace = workplace => {
    if (workplace.id) {
      return this.put(`/api/user-locations/${workplace.id}/`, workplace);
    }
    return this.post('/api/user-locations/', workplace);
  }
  deleteUserWorkplace = workplaceId => this.delete(`/api/user-locations/${workplaceId}/`);
  uploadWorkplaceLogo = (info, onUploadProgress) => this.uploadImage('user-location-images', info, onUploadProgress);
  deleteWorkplaceLogo = logoId => this.deleteImage('user-location-images', logoId);


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

  /* paypal */
  purchase = data => this.post('/api/paypal/purchase/', data);


  testSuccess() {
    return new Promise((resolve) => {
      setTimeout(() => { resolve(); }, 2000);
    });
  }
  testFailed() {
    return new Promise((resolve) => {
      setTimeout(() => { resolve(); }, 2000);
    });
  }
}
