import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';

import { getAllNewMsgs, getBusinesses } from 'redux/selectors';
import * as helper from 'utils/helper';

const Item = Menu.Item;

const MenuWrapper = styled(Menu)`
  &.ant-menu-inline {
    width: 200px;
    margin: 0 -16px;
    border-right: none;
  }

  .ant-menu-item .ant-badge {
    margin-top: -2px;
    margin-left: 8px;
    .ant-badge-count {
      box-shadow: none;
      background-color: #ff9300;
    }
  }
`;

class MainMenu extends React.Component {
  handleClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  render() {
    const { businesses, business, location, theme, mode, newMsgs } = this.props;
    const existBusiness = businesses.length > 0;
    let selectedKey = location.pathname.split('/')[2];
    if (location.pathname.indexOf('/recruiter/settings/credits') === 0) {
      selectedKey = 'credits';
    }

    return (
      <MenuWrapper theme={theme} mode={mode} selectedKeys={[selectedKey]} onClick={this.handleClick}>
        <Item key="jobs">
          <Link to="/recruiter/jobs">Jobs</Link>
        </Item>

        {existBusiness && (
          <Item key="applications">
            <Link to="/recruiter/applications/find">Applications</Link>
          </Item>
        )}

        {existBusiness && (
          <Item key="messages">
            <Link to="/recruiter/messages">
              Messages
              {selectedKey !== 'messages' && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
            </Link>
          </Item>
        )}

        {existBusiness && (
          <Item key="credits">
            <Link to="/recruiter/settings/credits">
              Credit
              {selectedKey !== 'credits' && <Badge count={(business || {}).tokens} />}
            </Link>
          </Item>
        )}

        {existBusiness && (
          <Item key="users">
            <Link to="/recruiter/users">Users</Link>
          </Item>
        )}
      </MenuWrapper>
    );
  }
}

export default withRouter(
  connect(state => {
    const businesses = getBusinesses(state);
    const { selectedId } = state.rc_businesses;
    const business = helper.getItemByID(businesses || [], selectedId);
    return {
      businesses,
      business,
      newMsgs: getAllNewMsgs(state)
    };
  })(MainMenu)
);
