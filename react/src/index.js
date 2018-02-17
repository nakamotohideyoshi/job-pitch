import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';

import App from 'containers/App';
import registerServiceWorker from './registerServiceWorker';
import configureStore from './configureStore';

import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/bootstrap.css';
import 'react-select/dist/react-select.css';
import 'antd/dist/antd.css';
import './globalStyles';

const history = createHistory();
const store = configureStore(history);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <App />
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
);
registerServiceWorker();
