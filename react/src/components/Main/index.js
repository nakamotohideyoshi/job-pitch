import React from 'react';
import { Layout } from 'antd';
import styled from 'styled-components';

import Header from './components/Header';
import Footer from './components/Footer';

const Wrapper = styled(Layout)`
  min-height: 100vh;
`;

const Content = styled(Layout.Content)`
  /* display: flex; */
  position: relative;
  margin-top: 50px;
`;

export default ({ menu, component: Component, ...rest }) => {
  const arr = rest.location.pathname.split('/');

  let helpUrl = 'https://www.myjobpitch.com/what-is-my-job-pitch/';
  if (arr[1] === 'recruiter') {
    helpUrl = 'https://www.myjobpitch.com/recruiters/';
  } else if (arr[1] === 'jobseeker') {
    helpUrl = 'https://www.myjobpitch.com/jobseeker/';
  }

  return (
    <Wrapper>
      <Header selectedKey={arr[2]} menu={menu} />

      <Content>
        <Component {...rest} />
      </Content>

      {arr[2] !== 'messages' && <Footer helpUrl={helpUrl} />}
    </Wrapper>
  );
};
