import { takeEvery, put } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import * as C from './constants';
import { Button } from 'antd';

// function* fetchData(action) {}

// // loading

// function* loadingShow() {
//   yield takeEvery(C.LOADING_SHOW, fetchData);
// }

// function* loadingHide() {
//   yield takeEvery(C.LOADING_HIDE, fetchData);
// }

// // set permission

// function* setPermission() {
//   yield takeEvery(C.SET_PERMISSION, fetchData);
// }

// // shared data

// function* setData() {
//   yield takeEvery(C.SET_VALUE, fetchData);
// }

export default [
  // loadingShow(),
  // loadingHide(),
  // setPermission(),
  // setData()
];
