import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';
import { getApplications, getAllApplications } from 'redux/applications';
import { updateCount } from 'redux/messages';

const Item = Menu.Item;

const StyledMenu = styled(Menu)`
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

  componentDidMount() {
    setInterval(() => {
      if (this.props.location.pathname.indexOf('/jobseeker/messages') === 0) {
        // alert('aaa');
      } else {
        this.props.getAllApplications();
      }
    }, 30000);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allApplications !== null) {
      this.props.updateCount({ applications: nextProps.allApplications, from_role: 1 });
    }
  }

  render() {
    const { profile, theme, mode, location, count } = this.props;
    const selectedKey = location.pathname.split('/')[2];

    var countStr = '';
    if (count > 0 && count < 10) {
      countStr = count;
    }
    if (count >= 9) {
      countStr = '10+';
    }

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
            Messages<Badge count={countStr} />
          </Link>
        </Item>
      </StyledMenu>
    );
  }
}

export default withRouter(
  connect(
    state => {
      const { allApplications } = state.applications;
      const { count } = state.messages;
      return {
        profile: state.js_profile.profile,
        allApplications,
        count
      };
    },
    {
      getApplications,
      getAllApplications,
      updateCount
    }
  )(MainMenu)
);
