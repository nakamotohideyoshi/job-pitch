import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu } from 'antd';

const Item = Menu.Item;

const StyledMenu = styled(Menu)`
  &.ant-menu-inline {
    width: 200px;
    margin: 0 -16px;
    border-right: none;
  }
`;

class MainMenu extends React.Component {
  handleClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  render() {
    const { profile, theme, mode, location } = this.props;
    const selectedKey = location.pathname.split('/')[2];

    if (!profile) return null;

    return (
      <StyledMenu theme={theme} mode={mode} selectedKeys={[selectedKey]} onClick={this.handleClick}>
        <Item key="find">
          <Link to="/jobseeker/find">Find Job</Link>
        </Item>
        <Item key="applications">
          <Link to="/jobseeker/applications">My Applications</Link>
        </Item>
        <Item key="messages">
          <Link to="/jobseeker/messages">Messages</Link>
        </Item>
      </StyledMenu>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      profile: state.js_profile.profile
    }),
    {}
  )(MainMenu)
);
