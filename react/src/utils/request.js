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

const request = ({ type, method, url, headers, payloadOnSuccess, payloadOnFail }) =>
  function* api(action = {}) {
    const { data, params, onUploadProgress, formData, success, fail } = action.payload || {};

    const requestType = type || action.type;

    try {
      if (requestType) {
        yield put({
          type: requestPending(requestType),
          payload: action.payload
        });
      }
      const token = localStorage.getItem('token');
      axios.defaults.headers.common.Authorization = token ? `Token ${token}` : '';

      const res = yield call(axios.request, {
        url: typeof url === 'string' ? url : url && url(action),
        method: method.toLowerCase(),
        headers: headers || {},
        data: formData ? convertFormData(data) : data,
        params,
        onUploadProgress
      });

      console.log('api:', res.data);

      if (requestType) {
        yield put({
          type: requestSuccess(requestType),
          payload: payloadOnSuccess ? payloadOnSuccess(res.data, action) : res.data
        });
      }

      success && success(res.data);

      return res.data;
    } catch (err) {
      const errRes = err.response;

      console.log('error:', errRes.data);

      // if (errRes.status === 403) {
      //   localStorage.removeItem('token');
      //   yield put({ type: LOGOUT });
      // }

      if (requestType) {
        yield put({
          type: requestFail(requestType),
          payload: payloadOnFail ? payloadOnFail(errRes, action) : errRes
        });
      }

      fail && fail(errRes);

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
