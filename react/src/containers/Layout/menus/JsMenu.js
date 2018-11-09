import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, Badge } from 'antd';
import { Icons } from 'components';

import { enabledEmployeeSelector, getAllNewMsgsSelector } from 'redux/selectors';

const MenuItem = Menu.Item;
const SubMenu = Menu.SubMenu;

const StyledMenu = styled(Menu)`
  &.ant-menu-inline {
    width: 200px;
    margin: 0 -16px;
    border-right: none;

    li {
      margin: 0;
    }
  }
`;

/* eslint-disable react/prop-types */
const JsMenu = ({ enabledEmployee, jobProfile, newMsgs, location }) => {
  if (!jobProfile) return null;

  const path2 = location.pathname.split('/')[2];

  return (
    <StyledMenu theme="dark" mode="horizontal" selectedKeys={[path2]}>
      {enabledEmployee && (
        <SubMenu
          title={
            <span className="submenu-title-wrapper">
              Recruit <Icons.AngleDown style={{ marginLeft: '5px' }} />
            </span>
          }
        >
          <MenuItem key="employee">
            <Link to="/employee">
              <Icons.Building />
              Employee
            </Link>
          </MenuItem>
        </SubMenu>
      )}

      <MenuItem key="find">
        <Link to="/jobseeker/find">Find Job</Link>
      </MenuItem>
      <MenuItem key="applications">
        <Link to="/jobseeker/applications">My Applications</Link>
      </MenuItem>
      <MenuItem key="interviews">
        <Link to="/jobseeker/interviews">Interviews</Link>
      </MenuItem>
      <MenuItem key="messages">
        <Link to="/jobseeker/messages">
          Messages
          {path2 !== 'messages' && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
        </Link>
      </MenuItem>
    </StyledMenu>
  );
};

export default withRouter(
  connect(state => {
    return {
      enabledEmployee: enabledEmployeeSelector(state),
      jobProfile: state.auth.jobProfile,
      newMsgs: getAllNewMsgsSelector(state)
    };
  })(JsMenu)
);
