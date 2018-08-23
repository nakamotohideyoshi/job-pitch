import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';

const Item = Menu.Item;

const StyledMenu = styled(Menu)`
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
    const { profile, theme, mode, location, newMsgs } = this.props;
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
        <Item key="interviews">
          <Link to="/jobseeker/interviews">Interviews</Link>
        </Item>
        <Item key="messages">
          <Link to="/jobseeker/messages">
            Messages
            {selectedKey !== 'messages' && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
          </Link>
        </Item>
      </StyledMenu>
    );
  }
}

export default withRouter(
  connect(state => {
    return {
      profile: state.js_profile.profile,
      newMsgs: state.applications.allNewMsgs
    };
  })(MainMenu)
);
