import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { all } from 'redux-saga/effects';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { MJPReducer, MJPSaga } from 'mjp-react-core';
import { RecruitReducers, RecruitSaga } from 'mjp-react-recruit';

function* rootSaga() {
  yield all([MJPSaga(), RecruitSaga()]);
}

export default function configureStore(history) {
  const rootReducer = combineReducers({
    mjp: MJPReducer,
    ...RecruitReducers,
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
