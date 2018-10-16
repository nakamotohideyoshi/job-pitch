import React from 'react';
import { MJPRouters } from 'mjp-react-core';

const App = () => {
  let RCRouters;
  if (process.env.REACT_APP_RECRUIT) {
    RCRouters = require('mjp-react-recruit').Routers;
  }

  let HRRouters;
  if (process.env.REACT_APP_HR) {
    HRRouters = require('mjp-react-hr').Routers;
  }

  let EMRouters;
  if (process.env.REACT_APP_EMPLOYEE) {
    EMRouters = require('mjp-react-employee').Routers;
  }

  return (
    <div>
      <MJPRouters />
      {RCRouters && <RCRouters />}
      {HRRouters && <HRRouters />}
      {EMRouters && <EMRouters />}
    </div>
  );
};

export default App;
