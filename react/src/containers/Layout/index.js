import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Layout, Alert } from 'antd';
import styled from 'styled-components';

import Header from './components/Header';
import Footer from './components/Footer';

const Wrapper = styled(Layout)`
  min-height: 100vh;
`;

const Main = styled(Layout)`
  position: relative;
  margin-top: 50px;

  .banner {
    padding-top: 20px;
  }
`;

const MainLayout = ({ menu, jobseeker, auth, component: Component, ...rest }) => {
  const arr = rest.location.pathname.split('/');

  let helpUrl = 'https://www.myjobpitch.com/what-is-my-job-pitch/';
  let url;
  if (arr[1] === 'recruiter') {
    helpUrl = 'https://www.myjobpitch.com/recruiters/';
    url = 'https://www.myjobpitch.com/recruiters/';
  } else if (arr[1] === 'jobseeker') {
    helpUrl = 'https://www.myjobpitch.com/jobseeker/';
    url = 'https://www.myjobpitch.com/candidates/';
  }
  const showBanner = auth === 'jobseeker' && jobseeker && !jobseeker.active;
  const showLink = rest.location.pathname.indexOf('/jobseeker/settings/profile') !== 0;

  return (
    <Wrapper>
      <Header selectedKey={arr[2]} menu={menu} url={url} />
      <Main>
        {showBanner && (
          <div className="container banner">
            <Alert
              message={
                <span>
                  Your profile is not active!
                  {` `}
                  {showLink && <Link to="/jobseeker/settings/profile">Activate</Link>}
                </span>
              }
              type="error"
            />
          </div>
        )}
        <Component {...rest} />
      </Main>

      {arr[2] !== 'messages' && <Footer helpUrl={helpUrl} />}
    </Wrapper>
  );
};

export default connect(state => ({
  jobseeker: state.js_profile.jobseeker,
  auth: state.auth.status
}))(MainLayout);
