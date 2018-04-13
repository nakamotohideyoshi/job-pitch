import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Breadcrumb, List, Avatar, Modal } from 'antd';

import { getBusinesses } from 'redux/recruiter/businesses';
import * as helper from 'utils/helper';

import { PageSubHeader, AlertMsg, LinkButton, Loading, ListEx } from 'components';

const { confirm } = Modal;

class BusinessList extends React.Component {
  componentWillMount() {
    if (!this.props.businesses) {
      this.props.getBusinesses();
    }
  }

  selectBusiness = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  addBusiness = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 1) {
      helper.saveData('tutorial', 2);
    }

    const { user, history } = this.props;
    if (user.can_create_businesses) {
      history.push('/recruiter/jobs/business/add');
    } else {
      confirm({
        content: `More than one company?`,
        okText: `Get in touch!`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          window.open('mailto:support@myjobpitch.com');
        }
      });
    }
  };

  editBusiness = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/jobs/business/edit/${id}`);
  };

  removeBusiness = ({ id, name, locations }, event) => {
    event && event.stopPropagation();

    const count = locations.length;
    let message;
    if (count === 0) {
      message = `Are you sure you want to delete ${name}`;
    } else {
      const s = count !== 1 ? 's' : '';
      message = `Deleting this business will also delete ${count} workplace${s} and all their jobs.
                If you want to hide the jobs instead you can deactive them.`;
    }

    confirm({
      content: message,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeBusiness({
          id
        });
      }
    });
  };

  renderBusiness = business => {
    const { id, name, tokens, locations, loading } = business;
    const logo = helper.getBusinessLogo(business);
    const strTokens = `${tokens} credit${tokens !== 1 ? 's' : ''}`;
    const count = locations.length;
    const strWorkplaces = `Includes ${count} workplace${count !== 1 ? 's' : ''}`;

    return (
      <List.Item
        key={id}
        actions={[
          <span onClick={e => this.editBusiness(business, e)}>Edit</span>,
          <span onClick={e => this.removeBusiness(business, e)}>Remove</span>
        ]}
        onClick={() => this.selectBusiness(business)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${name}`}
          description={
            <div className="properties">
              <span style={{ width: '120px' }}>{strTokens}</span>
              <span>{strWorkplaces}</span>
            </div>
          }
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const tutorial = helper.loadData('tutorial');
    return (
      <AlertMsg>
        <span>
          {tutorial === 1
            ? `Hi, Welcome to My Job Pitch
               Let's start by easily adding your business!`
            : `You have not added any businesses yet.`}
        </span>
        <a onClick={this.addBusiness}>{tutorial === 1 ? 'Get started!' : 'Create business'}</a>
      </AlertMsg>
    );
  };

  render() {
    const { businesses, error } = this.props;

    return (
      <Fragment>
        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>Businesses</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addBusiness}>Add Business</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={businesses}
            error={error && 'Server Error!'}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderBusiness}
            emptyRender={this.renderEmpty}
          />
        </div>
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    user: state.auth.user,
    businesses: state.rc_businesses.businesses,
    error: state.rc_businesses.error
  }),
  {
    getBusinesses
  }
)(BusinessList);
