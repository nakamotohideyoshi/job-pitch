import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import styled from 'styled-components';
import { Menu, Modal } from 'antd';
import faUserCircle from '@fortawesome/fontawesome-free-solid/faUserCircle';

import { Icons } from 'components';
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
            <Icons.Settings />
            Settings
          </Link>
        </Item>
        <Item key="signout">
          <Icons.SignOut />
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
