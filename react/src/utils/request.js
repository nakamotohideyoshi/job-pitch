import axios from 'axios';
import { call, put, take, race } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { LOGOUT } from 'redux/constants';
import { notification } from 'antd';
import { API_VERSION } from 'const';

axios.defaults.headers.common['Accept'] = `application/json; version=${API_VERSION}`;
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

const request = ({ type: type1, method, url, payloadOnSuccess, payloadOnFail }) =>
  function* api(action) {
    const { type: type2, payload } = action || {};
    const { data: reqData, isFormData, params, onUploadProgress, success, fail, successMsg, failMsg } = payload || {};
    const type = type1 || type2;

    try {
      type &&
        (yield put({
          type: requestPending(type),
          payload
        }));

      const token = localStorage.getItem('token');
      axios.defaults.headers.common.Authorization = token ? `Token ${token}` : '';

      const { data } = yield call(axios.request, {
        url: typeof url === 'string' ? url : url(payload),
        method: method.toLowerCase(),
        data: isFormData ? convertFormData(reqData) : reqData,
        params,
        onUploadProgress
      });

      type &&
        (yield put({
          type: requestSuccess(type),
          payload: payloadOnSuccess ? payloadOnSuccess(payload, data) : data,
          request: payload
        }));

      success && success(data);

      successMsg &&
        notification.success({
          message: successMsg.title || 'Notification',
          description: successMsg.message
        });

      console.log('api:', data);
      return data;
    } catch (err) {
      const { status, data } = err.response;

      if (status === 403 && data.detail === 'Invalid token.') {
        localStorage.removeItem('token');
        yield put({ type: LOGOUT });
      }

      type &&
        (yield put({
          type: requestFail(type),
          payload: payloadOnFail ? payloadOnFail(payload, data) : data,
          request: payload
        }));

      fail && fail(data);

      failMsg &&
        notification.error({
          message: failMsg.title || 'Notification',
          description: data.detail || failMsg.message
        });

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

export const weakRequest = api =>
  function* fun(action) {
    return yield race({
      result: call(api, action),
      cancel: take(LOCATION_CHANGE)
    });
  };

export default request;