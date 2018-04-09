import axios from 'axios';
import { call, put } from 'redux-saga/effects';
import { LOGOUT } from 'redux/constants';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
if (process.env.NODE_ENV !== 'production') {
  axios.defaults.baseURL = 'https://test.sclabs.co.uk';
}

const convertFormData = data => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    } else {
      formData.append(key, '');
    }
  });
  return formData;
};

const request = ({ method, url, success, fail }) =>
  function* api(action) {
    const { type, payload } = action || {};
    const { data: body, isFormData, params, onUploadProgress } = payload || {};
    try {
      if (type) {
        yield put({
          type: requestPending(type),
          payload
        });
      }

      const token = localStorage.getItem('token');
      axios.defaults.headers.common.Authorization = token ? `Token ${token}` : '';

      const { data } = yield call(axios.request, {
        url: typeof url === 'string' ? url : url && url(action),
        method: method.toLowerCase(),
        data: isFormData ? convertFormData(body) : body,
        params,
        onUploadProgress
      });

      if (type) {
        yield put({
          type: requestSuccess(type),
          payload: success ? success(data, action) : data
        });
      }

      console.log('api:', data);
      return data;
    } catch (err) {
      const { status, data } = err.response;

      if (status === 403 && data.detail === 'Invalid token.') {
        localStorage.removeItem('token');
        yield put({ type: LOGOUT });
      }

      if (type) {
        yield put({
          type: requestFail(type),
          payload: fail ? fail(data, action) : data
        });
      }

      console.log('error:', data);
      return null;
    }
  };

export const requestPending = type => `${type}/pending`;
export const requestSuccess = type => `${type}/success`;
export const requestFail = type => `${type}/fail`;

export const getRequest = params => request({ ...params, method: 'get' });
export const postRequest = params => request({ ...params, method: 'post' });
export const putRequest = params => request({ ...params, method: 'put' });
export const deleteRequest = params => request({ ...params, method: 'delete' });

export default request;
