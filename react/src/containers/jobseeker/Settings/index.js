import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Menu } from 'antd';

import { PageHeader } from 'components';
import ChangePassword from 'containers/auth/Password';
import Profile from './Profile';
import PitchRecord from './PitchRecord';
import JobProfile from './JobProfile';
import { TabMenu, Content } from './styled';

const Settings = ({ location, jobseeker }) => {
  const selectedKey = location.pathname.split('/')[3];

  if (!jobseeker && (selectedKey === 'jobprofile' || selectedKey === 'record')) {
    return <Redirect to="/jobseeker/settings/profile" />;
  }

  return (
    <div className="container">
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
          <Route exact path="/jobseeker/settings/profile" component={Profile} />
          <Route exact path="/jobseeker/settings/record" component={PitchRecord} />
          <Route exact path="/jobseeker/settings/jobprofile" component={JobProfile} />
          <Route exact path="/jobseeker/settings/password" component={ChangePassword} />
        </Switch>
      </Content>
    </div>
  );
};

export default connect(state => ({
  jobseeker: state.auth.jobseeker
}))(Settings);
