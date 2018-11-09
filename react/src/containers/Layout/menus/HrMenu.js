import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu } from 'antd';
import { Icons } from 'components';

import { enabledEmployeeSelector } from 'redux/selectors';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

/* eslint-disable react/prop-types */
const HrMenu = ({ enabledEmployee, location }) => {
  const path2 = location.pathname.split('/')[2];

  return (
    <Menu theme="dark" mode="horizontal" selectedKeys={[path2]}>
      <SubMenu
        title={
          <span className="submenu-title-wrapper">
            Manage <Icons.AngleDown style={{ marginLeft: '5px' }} />
          </span>
        }
      >
        <MenuItem key="recruit">
          <Link to="/select">
            <Icons.Briefcase />
            Recruit
          </Link>
        </MenuItem>

        {enabledEmployee && (
          <MenuItem key="employee">
            <Link to="/employee">
              <Icons.Building />
              Employee
            </Link>
          </MenuItem>
        )}
      </SubMenu>

      <MenuItem key="jobs">
        <Link to="/hr/jobs">Jobs</Link>
      </MenuItem>

      <MenuItem key="employees">
        <Link to="/hr/employees">Employees</Link>
      </MenuItem>
    </Menu>
  );
};

export default withRouter(
  connect(state => ({
    enabledEmployee: enabledEmployeeSelector(state)
  }))(HrMenu)
);
