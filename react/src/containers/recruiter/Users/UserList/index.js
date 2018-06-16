import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Truncate from 'react-truncate';
import { Breadcrumb, List, Tooltip } from 'antd';

import * as helper from 'utils/helper';

import { getUsers } from 'redux/recruiter/users';

import * as _ from 'lodash';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';
import DeleteDialog from './DeleteDialog';
import Wrapper from '../styled';

class UserList extends React.Component {
  state = {
    showDialog: false,
    selected: '',
    selectedUser: null
  };

  componentDidMount() {
    this.props.getUsers(this.props.business);
  }

  openDialog(event, id) {
    event && event.stopPropagation();
    this.setState({ showDialog: true, selected: id });
  }

  closeDialog = event => {
    event && event.stopPropagation();
    this.setState({ showDialog: false });
  };

  addUser = () => {
    const { business: { id }, history } = this.props;
    history.push(`/recruiter/users/${id}/add`);
  };

  editUser = (businessId, { id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/users/${businessId}/edit/${id}`);
  };

  showRemoveDialog = (selectedUser, event) => {
    event && event.stopPropagation();
    this.setState({ selectedUser });
  };

  renderUser = user => {
    const { id, email, locations, loading } = user;
    const { workplaces, business, userEmail } = this.props;
    let locationStr = '';
    if (locations.length === 0) {
      locationStr = 'Administrator';
    } else {
      _.forEach(locations, location => {
        let filteredWorkplaces = workplaces.filter(item => item.id === location);
        locationStr += filteredWorkplaces[0].name + ', ';
      });
      locationStr = locationStr.substring(0, locationStr.length - 2);
    }
    return (
      <List.Item
        key={id}
        actions={
          userEmail !== email
            ? [
                <Tooltip placement="bottom" title="Remove">
                  <span onClick={e => this.showRemoveDialog(user, e)}>
                    <Icons.TrashAlt />
                  </span>
                </Tooltip>
              ]
            : []
        }
        onClick={() => {
          if (userEmail !== email) {
            this.editUser(business.id, user);
          }
        }}
        className={`${loading ? 'loading' : ''}`}
      >
        <List.Item.Meta
          title={email}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {locationStr}
            </Truncate>
          }
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return (
      <AlertMsg>
        <span>This busniness doesn't seem to have any user yet!</span>
        <a onClick={this.addUser}>Create user</a>
      </AlertMsg>
    );
  };

  render() {
    const { users } = this.props;
    return (
      <Wrapper className="container">
        <Helmet title="My Users" />

        <PageHeader>
          <h2>My Users</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/recruiter/users/business">Businesses</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Users</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addUser}>Add new user</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={users}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderUser}
            emptyRender={this.renderEmpty}
          />
        </div>

        <DeleteDialog user={this.state.selectedUser} onCancel={() => this.showRemoveDialog()} />
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const businessId = helper.str2int(match.params.businessId);
    const business = helper.getItemByID(state.rc_businesses.businesses, businessId);
    let { workplaces } = state.rc_workplaces;
    workplaces = workplaces.filter(item => item.business === businessId);
    const { users } = state.rc_users;
    const userEmail = state.auth.user.email;
    return {
      business,
      workplaces,
      users,
      userEmail
    };
  },
  { getUsers }
)(UserList);
