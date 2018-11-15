import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LinkButton } from 'components';
import logoImage from '../assets/logo.png';

/* eslint-disable react/prop-types */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    margin-top: 100px;
  }

  h1 {
    margin-top: 40px;
    padding: 0 15px;
  }

  div {
    padding: 0 15px;
  }

  p {
    margin-top: 80px;
  }
`;

const NotFound = ({ history }) => (
  <Wrapper>
    <img src={logoImage} alt="" />
    <h1>This page doesn't exist</h1>
    <div>
      Please <LinkButton onClick={() => history.goBack()}>return</LinkButton> to the previous page, or visit our{' '}
      <Link to="/">home page</Link>
    </div>
    <p>Error 404</p>
  </Wrapper>
);

export default NotFound;
