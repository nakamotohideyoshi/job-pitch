import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MJPReducer, MJPSaga } from 'mjp-react-core';

let recruitModule;
if (process.env.REACT_APP_RECRUIT) {
  recruitModule = require('mjp-react-recruit');
}

let hrModule;
if (process.env.REACT_APP_HR) {
  hrModule = require('mjp-react-hr');
}

let employeeModule;
if (process.env.REACT_APP_EMPLOYEE) {
  employeeModule = require('mjp-react-employee');
}

function* rootSaga() {
  let sagas = [MJPSaga()];
  recruitModule && sagas.push(recruitModule.Saga());
  hrModule && sagas.push(hrModule.Saga());
  employeeModule && sagas.push(employeeModule.Saga());
  yield all(sagas);
}

export default function configureStore(history) {
  const rootReducer = combineReducers({
    mjp: MJPReducer,
    ...(recruitModule ? recruitModule.Reducers : {}),
    ...(hrModule ? hrModule.Reducers : {}),
    ...(employeeModule ? employeeModule.Reducers : {}),
    router: routerReducer
  });

  const sagaMiddleware = createSagaMiddleware();

  let enhancer = applyMiddleware(routerMiddleware(history), sagaMiddleware);
  if (process.env.NODE_ENV !== 'production') {
    enhancer = composeWithDevTools({})(enhancer);
  }

  const store = createStore(rootReducer, enhancer);
  sagaMiddleware.run(rootSaga);

  return store;
}
