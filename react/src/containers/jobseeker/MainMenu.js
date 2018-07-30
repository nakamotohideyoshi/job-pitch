import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';
import { getApplications, getAllApplications } from 'redux/applications';
import { updateCount, clearUpdated } from 'redux/messages';

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

var timer = null;

class MainMenu extends React.Component {
  handleClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  componentDidMount() {
    timer = setInterval(() => {
      // if (this.props.location.pathname.indexOf('/jobseeker/messages') === 0) {
      //   // alert('aaa');
      // } else {
      //   this.props.getAllApplications();
      // }
      const { auth_businesses, job_seeker } = this.props;
      if (!(auth_businesses.length === 0 && job_seeker === null)) {
        this.props.getAllApplications();
        this.props.clearUpdated();
      }
    }, 10000);
  }

  componentWillUnmount() {
    clearInterval(timer);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.allApplications !== null && !nextProps.updated) {
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

    if (this.props.location.pathname.indexOf('/jobseeker/messages') === 0) {
      countStr = '';
    }

    if (!profile) return null;

    return (
      <StyledMenu theme={theme} mode={mode} selectedKeys={[selectedKey]} onClick={this.handleClick}>
        <Item key="find">
          <Link to="/jobseeker/find">Find Job</Link>
        </Item>
        <Item key="applications">
          <Link to="/jobseeker/applications">New Applications</Link>
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
      const { count, updated } = state.messages;
      const { job_seeker } = state.auth.user;
      const auth_businesses = state.auth.user.businesses;
      return {
        profile: state.js_profile.profile,
        allApplications,
        count,
        updated,
        auth_businesses,
        job_seeker
      };
    },
    {
      getApplications,
      getAllApplications,
      updateCount,
      clearUpdated
    }
  )(MainMenu)
);
