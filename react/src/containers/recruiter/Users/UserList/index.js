import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { Select, List, Tooltip, Modal, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getUsersSelelctor } from 'redux/selectors';
import { selectBusinessAction } from 'redux/businesses';
import { getUsersAction, removeUserAction } from 'redux/recruiter/users';
import { PageHeader, PageSubHeader, SearchBox, ListEx, Logo, Loading, Icons, LinkButton, AlertMsg } from 'components';
import Wrapper from './styled';

const Option = Select.Option;
const { confirm, warning } = Modal;

/* eslint-disable react/prop-types */
class UserList extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const { businessId, business, history } = this.props;
    if (businessId !== business.id) {
      history.replace(`/recruiter/users/${business.id}`);
    } else {
      this.selectedBusiness(business);
    }
  }

  componentWillReceiveProps({ businessId, business }) {
    if (businessId !== this.props.businessId) {
      this.selectedBusiness(business);
    }
  }

  selectedBusiness = ({ id, restricted }) => {
    if (!restricted) {
      this.props.getUsersAction(id);
    }
    this.props.selectBusinessAction(id);
    helper.saveData('users_bid', id);
  };

  selectBusiness = id => {
    this.props.history.replace(`/recruiter/users/${id}`);
  };

  addUser = () => {
    this.props.history.push(`/recruiter/users/add/${this.props.businessId}`);
  };

  selectUser = ({ id, email }) => {
    if (DATA.email === email) {
      warning({
        title: 'Cannot edit currently logged in user',
        maskClosable: true
      });
    } else {
      this.props.history.push(`/recruiter/users/edit/${id}`);
    }
  };

  removeUser = (id, event) => {
    event && event.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this user?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeUserAction({
          id,
          business: this.props.businessId,
          onSuccess: () => {
            message.success('The user is removed');
          },
          onFail: () => {
            message.error('There was an error removing the user');
          }
        });
      }
    });
  };

  changeSearchText = searchText => {
    this.setState({ searchText });
  };

  filterOption = ({ email, comment }) => {
    const searchText = this.state.searchText.toLowerCase();
    return email.toLowerCase().indexOf(searchText) >= 0 || comment.toLowerCase().indexOf(searchText) >= 0;
  };

  renderUser = user => {
    const { id, email, comment, loading } = user;
    return (
      <List.Item
        key={id}
        actions={
          DATA.email !== email
            ? [
                <Tooltip placement="bottom" title="Remove">
                  <span onClick={e => this.removeUser(id, e)}>
                    <Icons.TrashAlt />
                  </span>
                </Tooltip>
              ]
            : []
        }
        onClick={() => this.selectUser(user)}
        className={`${loading ? 'loading' : ''}`}
      >
        <List.Item.Meta
          title={email}
          description={
            <Truncate lines={1} ellipsis={<span>...</span>}>
              {comment}
            </Truncate>
          }
        />
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return (
      <AlertMsg>
        {this.props.business.restricted ? (
          <span>You must an administrator to view this information.</span>
        ) : (
          <Fragment>
            <span>This busniness doesn't seem to have any user yet!</span>
            <LinkButton onClick={this.addUser}>Create user</LinkButton>
          </Fragment>
        )}
      </AlertMsg>
    );
  };

  render() {
    const { businesses, business, users } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="My Users" />

        <PageHeader>
          <h2>My Users</h2>
        </PageHeader>

        <PageSubHeader>
          <Select value={business.id} onChange={this.selectBusiness}>
            {businesses.map(b => {
              const logo = helper.getBusinessLogo(b);
              return (
                <Option key={b.id} value={b.id}>
                  <Logo src={logo} className="logo" size="22px" />
                  {b.name}
                </Option>
              );
            })}
          </Select>
          <SearchBox width="200px" onChange={this.changeSearchText} />
        </PageSubHeader>

        <PageSubHeader>
          <div />
          {!business.restricted && <LinkButton onClick={this.addUser}>Add new user</LinkButton>}
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={business.restricted ? [] : users}
            renderItem={this.renderUser}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const { businesses } = state.businesses;
    const businessId = helper.str2int(match.params.businessId);
    const businessId1 = businessId || helper.loadData('users_bid');
    const business = helper.getItemById(businesses, businessId1) || businesses[0];

    return {
      businesses,
      businessId,
      business,
      users: getUsersSelelctor(state)
    };
  },
  {
    selectBusinessAction,
    getUsersAction,
    removeUserAction
  }
)(UserList);
