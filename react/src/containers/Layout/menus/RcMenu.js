import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';
import { Icons } from 'components';

import * as helper from 'utils/helper';
import { enabledHRSelector, enabledEmployeeSelector, getAllNewMsgsSelector } from 'redux/selectors';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

/* eslint-disable react/prop-types */
const RcMenu = ({ enabledHR, enabledEmployee, businesses, selectedBusiness, newMsgs, location }) => {
  if (!businesses.length) return null;

  let path2 = location.pathname.split('/')[2];
  if (location.pathname.indexOf('/recruiter/settings/credits') === 0) {
    path2 = 'credits';
  }

  return (
    <Menu theme="dark" mode="horizontal" selectedKeys={[path2]}>
      {(enabledHR || enabledEmployee) && (
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              Recruit <Icons.AngleDown style={{ marginLeft: '5px' }} />
            </span>
          }
        >
          {enabledHR && (
            <MenuItem key="hr">
              <Link to="/hr">
                <Icons.UserFriends />
                Manage
              </Link>
            </MenuItem>
          )}

          {enabledEmployee && (
            <MenuItem key="employee">
              <Link to="/employee">
                <Icons.Building />
                Employee
              </Link>
            </MenuItem>
          )}
        </SubMenu>
      )}

      <MenuItem key="jobs">
        <Link to="/recruiter/jobs">Jobs</Link>
      </MenuItem>

      <MenuItem key="applications">
        <Link to="/recruiter/applications/find">Applications</Link>
      </MenuItem>

      <MenuItem key="messages">
        <Link to="/recruiter/messages">
          Messages
          {path2 !== 'messages' && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
        </Link>
      </MenuItem>

      <MenuItem key="credits">
        <Link to="/recruiter/settings/credits">
          Credit
          {path2 !== 'credits' && <Badge count={(selectedBusiness || {}).tokens} />}
        </Link>
      </MenuItem>

      <MenuItem key="users">
        <Link to="/recruiter/users">Users</Link>
      </MenuItem>
    </Menu>
  );
};

export default withRouter(
  connect(state => {
    const { businesses, selectedId } = state.businesses;
    const selectedBusiness = helper.getItemById(businesses, selectedId);
    return {
      businesses,
      selectedBusiness,
      newMsgs: getAllNewMsgsSelector(state),
      enabledHR: enabledHRSelector(state),
      enabledEmployee: enabledEmployeeSelector(state)
    };
  })(RcMenu)
);
