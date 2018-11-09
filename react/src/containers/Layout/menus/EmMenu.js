import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu } from 'antd';
import { Icons } from 'components';

import { enabledHRSelector } from 'redux/selectors';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

/* eslint-disable react/prop-types */
const EmMenu = ({ enabledHR, location }) => {
  const path2 = location.pathname.split('/')[2];

  return (
    <Menu theme="dark" mode="horizontal" selectedKeys={[path2]}>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            Employee <Icons.AngleDown style={{ marginLeft: '5px' }} />
          </span>
        }
      >
        <MenuItem key="recruit">
          <Link to="/select">
            <Icons.Briefcase />
            Recruit
          </Link>
        </MenuItem>

        {enabledHR && (
          <MenuItem key="hr">
            <Link to="/hr">
              <Icons.UserFriends />
              Manage
            </Link>
          </MenuItem>
        )}
      </SubMenu>
    </Menu>
  );
};

export default withRouter(
  connect(state => ({
    enabledHR: enabledHRSelector(state)
  }))(EmMenu)
);
