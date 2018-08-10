import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Menu, Badge } from 'antd';

import { getApplications, getAllApplications } from 'redux/applications';
import { updateCount, clearUpdated } from 'redux/messages';

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

var timer = null;

class MainMenu extends React.Component {
  handleClick = () => {
    const { onClick } = this.props;
    onClick && onClick();
  };

  componentDidMount() {
    timer = setInterval(() => {
      // if (this.props.location.pathname.indexOf('/recruiter/messages') === 0) {
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
      this.props.updateCount({ applications: nextProps.allApplications, from_role: 2 });
    }
  }

  render() {
    const { businesses, business, location, theme, mode, count } = this.props;
    const existBusiness = businesses.length > 0;
    let selectedKey = location.pathname.split('/')[2];
    if (location.pathname.indexOf('/recruiter/settings/credits') === 0) {
      selectedKey = 'credits';
    }
    var countStr = '';
    if (count > 0 && count < 10) {
      countStr = count;
    }
    if (count >= 9) {
      countStr = '10+';
    }
    if (this.props.location.pathname.indexOf('/recruiter/messages') === 0) {
      countStr = '';
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
              Messages<Badge count={countStr} />
            </Link>
          </Item>
        )}

        {existBusiness && (
          <Item key="credits">
            <Link to="/recruiter/settings/credits">
              Credit<Badge count={(business || {}).tokens} />
            </Link>
          </Item>
        )}

        <Item key="users">
          <Link to="/recruiter/users">Users</Link>
        </Item>
      </MenuWrapper>
    );
  }
}

export default withRouter(
  connect(
    state => {
      const { businesses, selectedId } = state.rc_businesses;
      const { allApplications } = state.applications;
      const { count, updated } = state.messages;
      const { job_seeker } = state.auth.user;
      const auth_businesses = state.auth.user.businesses;
      const business = helper.getItemByID(businesses || [], selectedId);
      return {
        businesses,
        business,
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
