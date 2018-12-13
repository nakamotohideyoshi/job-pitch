import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Tabs } from 'antd';

import { PageHeader, PasswordForm } from 'components';
import Profile from './Profile';
import PitchRecord from './PitchRecord';
import JobProfile from './JobProfile';
import Wrapper from './styled';

const TabPane = Tabs.TabPane;

/* eslint-disable react/prop-types */
const Settings = ({ location, history, jobseeker }) => {
  const activeKey = location.pathname.split('/')[3];

  const selecteTab = tab => {
    const paths = location.pathname.split('/');
    paths[3] = tab;
    history.push(paths.join('/'));
  };

  return (
    <Wrapper className="container">
      <Helmet title="Settings" />

      <PageHeader>
        <h2>Settings</h2>
      </PageHeader>

      <Tabs activeKey={activeKey} animated={false} onChange={selecteTab}>
        <TabPane tab="My Details" key="profile">
          <Profile />
        </TabPane>

        {jobseeker && (
          <TabPane tab="Job Criteria" key="jobprofile">
            <JobProfile />
          </TabPane>
        )}

        {jobseeker && (
          <TabPane tab="Record Pitch" key="record">
            <PitchRecord />
          </TabPane>
        )}

        {jobseeker && (
          <TabPane tab="Change Password" key="password">
            <PasswordForm />
          </TabPane>
        )}
      </Tabs>
    </Wrapper>
  );
};

export default connect(state => ({
  jobseeker: state.auth.jobseeker
}))(Settings);
