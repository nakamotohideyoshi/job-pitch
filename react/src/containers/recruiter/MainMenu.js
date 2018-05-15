import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';

import * as helper from 'utils/helper';

const Item = Menu.Item;

const MenuWrapper = styled(Menu)`
  &.ant-menu-inline {
    width: 200px;
    margin: 0 -16px;
    border-right: none;
  }

  .ant-menu-item .ant-badge {
    color: inherit;
    margin-left: 5px;
    .ant-badge-count {
      margin: 0 0 3px 3px;
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
    const { businesses, business, location, theme, mode } = this.props;
    const existBusiness = businesses.length > 0;
    let selectedKey = location.pathname.split('/')[2];
    if (location.pathname.indexOf('/recruiter/settings/credits') === 0) {
      selectedKey = 'credits';
    }

    return (
      <MenuWrapper theme={theme} mode={mode} selectedKeys={[selectedKey]} onClick={this.handleClick}>
        {existBusiness && (
          <Item key="applications">
            <Link to="/recruiter/applications/find">Applications</Link>
          </Item>
        )}

        <Item key="jobs">
          <Link to="/recruiter/jobs">Jobs</Link>
        </Item>

        {existBusiness && (
          <Item key="credits">
            <Link to="/recruiter/settings/credits">
              Credit<Badge count={(business || {}).tokens} />
            </Link>
          </Item>
        )}

        {existBusiness && (
          <Item key="messages">
            <Link to="/recruiter/messages">Messages</Link>
          </Item>
        )}
      </MenuWrapper>
    );
  }
}

export default withRouter(
  connect(state => {
    const { businesses, selectedId } = state.rc_businesses;
    const business = helper.getItemByID(businesses || [], selectedId);
    return {
      businesses,
      business
    };
  })(MainMenu)
);
