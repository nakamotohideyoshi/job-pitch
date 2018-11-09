import { combineReducers, createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import rootSaga from 'redux/sagas';
import reducers from 'redux/reducers';

export default function configureStore(history) {
  const rootReducer = combineReducers({
    ...reducers,
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
