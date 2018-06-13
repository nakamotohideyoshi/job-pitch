import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Breadcrumb, List, Avatar } from 'antd';

import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, Loading, ListEx } from 'components';

import Wrapper from '../styled';

class BusinessListForUser extends React.Component {
  selectBusiness = ({ id }) => {
    this.props.history.push(`/recruiter/jobs/workplace/${id}`);
  };

  renderBusiness = business => {
    const { id, name, tokens, locations, loading } = business;
    const logo = helper.getBusinessLogo(business);

    return (
      <List.Item key={id} onClick={() => this.selectBusiness(business)} className={loading ? 'loading' : ''}>
        <List.Item.Meta
          style={{ alignItems: 'center' }}
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={name}
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  render() {
    return (
      <Wrapper className="container">
        <Helmet title="My Businesses" />

        <PageHeader>
          <h2>My Businesses</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>Businesses</Breadcrumb.Item>
          </Breadcrumb>
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

export default connect(state => {
  const businesses = state.rc_businesses.businesses.slice(0);
  return {
    user: state.auth.user,
    businesses
  };
})(BusinessListForUser);
