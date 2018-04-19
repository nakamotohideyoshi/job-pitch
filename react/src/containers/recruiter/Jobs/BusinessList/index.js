import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Breadcrumb, List, Avatar, Modal } from 'antd';

import { removeBusiness } from 'redux/recruiter/businesses';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, AlertMsg, LinkButton, Loading, ListEx, Icons } from 'components';
import Wrapper from '../styled';

const { confirm } = Modal;

class BusinessList extends React.Component {
  selectBusiness = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  addBusiness = () => {
    const tutorial = helper.loadData('tutorial');
    if (tutorial === 1) {
      helper.saveData('tutorial', 2);
    }

    const { user, history } = this.props;
    if (user.can_create_businesses || user.businesses.length === 0) {
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
    let content;
    if (count === 0) {
      content = `Are you sure you want to delete ${name}`;
    } else {
      const s = count !== 1 ? 's' : '';
      content = `Deleting this business will also delete ${count} workplace${s} and all their jobs.
                If you want to hide the jobs instead you can deactive them.`;
    }

    confirm({
      content,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeBusiness({
          id,
          successMsg: {
            message: `Business(${name}) is removed.`
          },
          failMsg: {
            message: `Removing business(${name}) is failed.`
          }
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
          <span onClick={e => this.editBusiness(business, e)}>
            <Icons.Pen />
          </span>,
          <span onClick={e => this.removeBusiness(business, e)}>
            <Icons.TrashAlt />
          </span>
        ]}
        onClick={() => this.selectBusiness(business)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          style={{ alignItems: 'center' }}
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={name}
        />
        <div className="properties">
          <span style={{ width: '120px' }}>{strTokens}</span>
          <span style={{ width: '130px' }}>{strWorkplaces}</span>
        </div>
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
    return (
      <Wrapper className="container">
        <Helmet title="My Workplace & Jobs" />

        <PageHeader>
          <h2>My Workplace & Jobs</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>Businesses</Breadcrumb.Item>
          </Breadcrumb>
          <LinkButton onClick={this.addBusiness}>Add Business</LinkButton>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={this.props.businesses}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderBusiness}
            emptyRender={this.renderEmpty}
          />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const businesses = state.rc_businesses.businesses.slice(0);
    helper.sort(businesses, 'name');
    return {
      user: state.auth.user,
      businesses
    };
  },
  {
    removeBusiness
  }
)(BusinessList);
