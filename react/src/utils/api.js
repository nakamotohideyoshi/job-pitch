import axios from 'axios';
import AWS from 'aws-sdk';
import localForage from 'localforage';

if (process.env.NODE_ENV !== 'production') {
  axios.defaults.baseURL = 'https://test.sclabs.co.uk';
}
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

/**
|--------------------------------------------------
| setToken
|--------------------------------------------------
*/

export const loadToken = () =>
  localForage.getItem('token').then(function(value) {
    axios.defaults.headers.common.Authorization = value ? `Token ${value}` : '';
    return value;
  });

export const setToken = value => {
  axios.defaults.headers.common.Authorization = value ? `Token ${value}` : '';
  localForage.setItem('token', value);
};

/**
|--------------------------------------------------
| responseData, handleError
|--------------------------------------------------
*/

const responseData = response => {
  console.log('api data', response.data);
  return response.data;
};

const handleError = error => {
  console.log('api error', error.response);
  let data;

  if (error.response) {
    if (error.response.status === 500) {
      data = { message: error.response.statusText };
    } else {
      data = error.response.data;
    }
  } else {
    data = { message: 'Network Error' };
  }

  throw data;
};

/**
|--------------------------------------------------
| get, post, put, delelte
|--------------------------------------------------
*/

export const formData = data => {
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
};

export const getVersion = () => new Promise(resolve => resolve({ version: 'v0.1' }));

export const get = (url, config) => {
  return axios.get(url, config).then(responseData, handleError);
};

export const post = (url, info, config) => {
  return axios.post(url, info, config).then(responseData, handleError);
};

export const put = (url, info, config) => {
  return axios.put(url, info, config).then(responseData, handleError);
};

export const del = (url, config) => {
  return axios.delete(url, config).then(responseData, handleError);
};

/**
|--------------------------------------------------
| upload pitch (aws)
|--------------------------------------------------
*/

export const uploadPitch = (pitch, pitchData, onUploadProgress) =>
  new Promise(resolve => {
    const folder = window.location.origin.replace('//', '');
    const s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      credentials: new AWS.CognitoIdentityCredentials(
        {
          IdentityPoolId: 'eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2'
        },
        {
          region: 'eu-west-1'
        }
      )
    });
    s3
      .upload(
        {
          Bucket: 'mjp-android-uploads',
          Key: `${folder}/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
          Body: pitchData,
          ContentType: 'video/webm'
        },
        (error, data) => {
          if (error) {
            throw error;
          }
          resolve();
        }
      )
      .on('httpUploadProgress', progress => {
        onUploadProgress('Uploading...', Math.floor(progress.loaded / progress.total * 100));
      });
  });
