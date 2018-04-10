import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Menu, Modal } from 'antd';
import styled from 'styled-components';

import { logout } from 'redux/auth';

import { Icons } from 'components';

const Wrapper = styled(Menu)`
  &.ant-menu {
    width: 160px;
    margin: 0 -16px;
    border-right: none;
  }
`;

const Item = Menu.Item;
const confirm = Modal.confirm;

class UserMenu extends React.PureComponent {
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
    const { selectedKey, status } = this.props;

    return (
      <Wrapper mode="inline" selectedKeys={[selectedKey]} onClick={this.handleClick}>
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
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    status: state.auth.status
  }),
  { logout }
)(UserMenu);
