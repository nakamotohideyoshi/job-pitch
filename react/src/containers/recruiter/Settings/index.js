import React from 'react';
import Helmet from 'react-helmet';
import { Tabs } from 'antd';

import { PageHeader, PasswordForm } from 'components';
import Credits from './Credits';
import Wrapper from './styled';

const TabPane = Tabs.TabPane;

/* eslint-disable react/prop-types */
const RCSettings = ({ location, history }) => {
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
        <TabPane tab="Credits" key="credits">
          <Credits />
        </TabPane>

        <TabPane tab="Change Password" key="password">
          <PasswordForm />
        </TabPane>
      </Tabs>
    </Wrapper>
  );
};

export default RCSettings;
