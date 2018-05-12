import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import styled from 'styled-components';

import Header from './components/Header';
import Footer from './components/Footer';
import SharePanel from './components/SharePanel';

const Wrapper = styled(Layout)`
  min-height: 100vh;
`;

const Main = styled(Layout)`
  /* display: flex; */
  position: relative;
  margin-top: 50px;
`;

const MainLayout = ({ status, menu, component: Component, ...rest }) => {
  const arr = rest.location.pathname.split('/');

  let helpUrl = 'https://www.myjobpitch.com/what-is-my-job-pitch/';
  if (arr[1] === 'recruiter') {
    helpUrl = 'https://www.myjobpitch.com/recruiters/';
  } else if (arr[1] === 'jobseeker') {
    helpUrl = 'https://www.myjobpitch.com/jobseeker/';
  }

  let url;
  if (status === 'recruiter') {
    url = 'https://www.myjobpitch.com/recruiters/';
  } else if (status === 'jobseeker') {
    url = 'https://www.myjobpitch.com/candidates/';
  }

  return (
    <Wrapper>
      <Header selectedKey={arr[2]} menu={menu} />

      <Main>
        <Component {...rest} />
      </Main>

      {arr[2] !== 'messages' && <Footer helpUrl={helpUrl} />}

      {arr[2] !== 'messages' && url && <SharePanel url={url} />}
    </Wrapper>
  );
};

export default connect(state => ({
  status: state.auth.status
}))(MainLayout);
