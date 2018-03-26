import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, Modal } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
import faUserCircle from '@fortawesome/fontawesome-free-solid/faUserCircle';
import faSignOutAlt from '@fortawesome/fontawesome-free-solid/faSignOutAlt';

import { logout } from 'redux/auth';
import PopoverMenu from '../PopoverMenu';

const Item = Menu.Item;
const confirm = Modal.confirm;

const MenuWrapper = styled(Menu)`
  &.ant-menu {
    width: 160px;
    margin: 0 -16px;
    border-right: none;
  }
`;

class UserMenu extends React.Component {
  handleClick = ({ key }) => {
    const { onClick, logout } = this.props;

    onClick && onClick();

    if (key === 'signout') {
      confirm({
        title: 'Are you sure you want to sign out?',
        okText: 'Sign out',
        maskClosable: true,
        onOk: () => {
          logout();
        }
      });
    }
  };

  render() {
    const { location, status } = this.props;
    const selectedKey = location.pathname.split('/')[2];

    return (
      <MenuWrapper mode="inline" selectedKeys={[selectedKey]} onClick={this.handleClick}>
        <Item key="settings">
          <Link to={`/${status}/settings`}>
            <FontAwesomeIcon icon={faCog} />
            Settings
          </Link>
        </Item>
        <Item key="signout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          Sign out
        </Item>
      </MenuWrapper>
    );
  }
}

export default () => {
  return (
    <PopoverMenu
      float="right"
      menu={withRouter(
        connect(
          state => ({
            status: state.auth.status
          }),
          { logout }
        )(UserMenu)
      )}
      icon={faUserCircle}
    />
  );
};
