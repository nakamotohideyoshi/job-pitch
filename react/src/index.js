import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import MobilePopup from './components/MobilePopup';

import * as serviceWorker from './serviceWorker';
import configureStore from './configureStore';
import App from './App';

const history = createHistory();
const store = configureStore(history);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MobilePopup>
        <App />
      </MobilePopup>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
