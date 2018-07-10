import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import styled from 'styled-components';

import Header from './components/Header';
import Footer from './components/Footer';

import { Link } from 'react-router-dom';
import colors from 'utils/colors';

const Wrapper = styled(Layout)`
  min-height: 100vh;
`;

const Main = styled(Layout)`
  /* display: flex; */
  position: relative;
  margin-top: 50px;
`;

const Banner = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 5px;
  a {
    margin-left: 10px;
    color: white;
    font-size: 16px;
  }
  a:hover {
    color: white;
  }
  > div {
    padding: 2px 10px 2px 10px;
    background-color: ${colors.yellow};
    border-radius: 4px;
    color: white;
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
  var bannerShown = false;
  if (auth === 'jobseeker') {
    if (jobseeker !== null) {
      bannerShown = !jobseeker.active;
    }
  }

  var linkShown = rest.location.pathname !== '/jobseeker/settings/profile';

  return (
    <Wrapper>
      <Header selectedKey={arr[2]} menu={menu} url={url} />
      <Main>
        {bannerShown ? (
          <Banner>
            <div>
              Your profile is not active!
              {linkShown ? <Link to="/jobseeker/settings/profile">Activate</Link> : undefined}
            </div>
          </Banner>
        ) : (
          undefined
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
