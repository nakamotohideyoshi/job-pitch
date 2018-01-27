import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import Wrapper from './Wrapper';
import logoImage from 'assets/logo.png';

const NotFound = ({ history }) => (
  <Wrapper>
    <img src={logoImage} alt="" />
    <h1>This page doesn't exist</h1>
    <div>
      Please <a onClick={() => history.goBack()}>return</a> to the previous page, or visit our{' '}
      <Link to="/">home page</Link>
    </div>
    <p>Error 404</p>
  </Wrapper>
);

export default withRouter(NotFound);
