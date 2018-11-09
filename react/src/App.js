import React from 'react';

import 'styles/antd.css';
import GlobalStyle from 'styles/global';

import Routers from 'containers/Routers';

const App = () => {
  return (
    <div>
      <GlobalStyle />
      <Routers />
    </div>
  );
};

export default App;
