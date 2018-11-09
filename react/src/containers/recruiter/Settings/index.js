import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, Link } from 'react-router-dom';
import { Menu } from 'antd';

import { PageHeader, PasswordForm } from 'components';
import Credits from './Credits';
import { TabMenu, Content } from './styled';

/* eslint-disable react/prop-types */
const RCSettings = ({ location, businesses }) => {
  const selectedKey = location.pathname.split('/')[3];

  if (!businesses.length && selectedKey === 'credits') {
    return <Redirect to="/recruiter/settings/password" />;
  }

  return (
    <div className="container">
      <Helmet title="Settings" />

      <PageHeader>
        <h2>Settings</h2>
      </PageHeader>

      <TabMenu mode="horizontal" selectedKeys={[selectedKey]}>
        {businesses.length && (
          <Menu.Item key="credits">
            <Link to="/recruiter/settings/credits">Credits</Link>
          </Menu.Item>
        )}

        <Menu.Item key="password">
          <Link to="/recruiter/settings/password">Change Password</Link>
        </Menu.Item>
      </TabMenu>

      <Content>
        <Switch>
          <Route exact path="/recruiter/settings/credits" component={Credits} />
          <Route exact path="/recruiter/settings/credits/:businessId" component={Credits} />
          <Route exact path="/recruiter/settings/password" component={PasswordForm} />
        </Switch>
      </Content>
    </div>
  );
};

export default connect(state => ({
  businesses: state.businesses.businesses
}))(RCSettings);
