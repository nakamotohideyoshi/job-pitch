import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { Select, List, Tooltip, Modal, notification } from 'antd';

import { getBusinesses, getUsers as getUsersFromStore } from 'redux/selectors';
import { selectBusiness } from 'redux/recruiter/businesses';
import { getUsers, removeUser } from 'redux/recruiter/users';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, SearchBox, ListEx, Logo, Loading, Icons, LinkButton, AlertMsg } from 'components';
import Wrapper from './styled';

const Option = Select.Option;
const { confirm, warning } = Modal;

class UserList extends React.Component {
  state = {
    searchText: ''
  };

  componentWillMount() {
    const { businessId, business, history } = this.props;
    if (businessId !== business.id) {
      history.replace(`/recruiter/users/${business.id}`);
    } else {
      this.selectBusiness(businessId);
    }
  }

  componentWillReceiveProps({ businessId }) {
    if (businessId !== this.props.businessId) {
      this.selectBusiness(businessId);
    }
  }

  selectBusiness = id => {
    this.props.getUsers(id);
    this.props.selectBusiness(id);
    helper.saveData('users/businessId', id);
  };

  onSelectBusiness = ({ id }) => {
    this.props.history.replace(`/recruiter/users/${id}`);
  };

  onAddUser = () => {
    this.props.history.push(`/recruiter/users/add/${this.props.businessId}`);
  };

  onSelect = ({ id, email }) => {
    if (DATA.email === email) {
      warning({
        content: 'Cannot edit currently logged in user',
        maskClosable: true
      });
      return;
    }

    this.props.history.push(`/recruiter/users/edit/${id}`);
  };

  onRemove = (id, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to delete this user?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeUser({
          id,
          business: this.props.businessId,
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The user is removed'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error removing the user'
            });
          }
        });
      }
    });
  };

  onChangeSearchText = searchText => this.setState({ searchText });

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
                  <span onClick={e => this.onRemove(id, e)}>
                    <Icons.TrashAlt />
                  </span>
                </Tooltip>
              ]
            : []
        }
        onClick={() => this.onSelect(user)}
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
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return (
      <AlertMsg>
        <span>This busniness doesn't seem to have any user yet!</span>
        <a onClick={this.onAddUser}>Create user</a>
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
          <Select value={business.id} onChange={this.onSelectBusiness}>
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
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageSubHeader>

        <PageSubHeader>
          <div />
          <LinkButton onClick={this.onAddUser}>Add new user</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={users}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
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
    const businesses = getBusinesses(state);
    const businessId = helper.str2int(match.params.businessId);
    const businessId1 = businessId || helper.loadData('users/businessId');
    const business = helper.getItemByID(businesses, businessId1) || businesses[0];

    return {
      businesses,
      businessId,
      business,
      users: getUsersFromStore(state)
    };
  },
  {
    selectBusiness,
    getUsers,
    removeUser
  }
)(UserList);
