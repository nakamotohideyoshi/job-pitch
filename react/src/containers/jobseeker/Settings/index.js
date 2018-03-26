import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Menu } from 'antd';

import { Container, PageHeader, PasswordForm } from 'components';
import ProfileForm from './ProfileForm';
import PitchRecord from './PitchRecord';
import JobProfileForm from './JobProfileForm';
import { TabMenu, Content } from './Wrapper';

const JSSettings = ({ location, jobseeker }) => {
  const selectedKey = location.pathname.split('/')[3];

  if (!jobseeker && (selectedKey === 'jobprofile' || selectedKey === 'record')) {
    return <Redirect to="/jobseeker/settings/profile" />;
  }

  return (
    <Container>
      <Helmet title="Settings" />

      <PageHeader>
        <h2>Settings</h2>
      </PageHeader>

      <TabMenu mode="horizontal" selectedKeys={[selectedKey]}>
        <Menu.Item key="profile">
          <Link to="/jobseeker/settings/profile">My Profile</Link>
        </Menu.Item>
        {jobseeker && (
          <Menu.Item key="jobprofile">
            <Link to="/jobseeker/settings/jobprofile">Job Profile</Link>
          </Menu.Item>
        )}
        {jobseeker && (
          <Menu.Item key="record">
            <Link to="/jobseeker/settings/record">Record Pitch</Link>
          </Menu.Item>
        )}
        <Menu.Item key="password">
          <Link to="/jobseeker/settings/password">Change Password</Link>
        </Menu.Item>
      </TabMenu>

      <Content>
        <Switch>
          <Route exact path="/jobseeker/settings/profile" component={ProfileForm} />
          <Route exact path="/jobseeker/settings/record" component={PitchRecord} />
          <Route exact path="/jobseeker/settings/jobprofile" component={JobProfileForm} />
          <Route exact path="/jobseeker/settings/password" component={PasswordForm} />
        </Switch>
      </Content>
    </Container>
  );
};

export default connect(state => ({
  jobseeker: state.auth.jobseeker
}))(JSSettings);
