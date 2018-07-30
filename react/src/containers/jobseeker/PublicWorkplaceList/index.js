import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Avatar, Breadcrumb } from 'antd';

import { findPublicJobListing } from 'redux/jobseeker/find';

import * as helper from 'utils/helper';

import { PageHeader, AlertMsg, Loading, ListEx, PageSubHeader } from 'components';
import Mark from './Mark';
import Wrapper from './styled';
const defaultLogo = require('assets/default_logo.jpg');

class JSPublicWorkplaceList extends React.Component {
  state = {
    selectedJob: null,
    showDialog: false,
    selected: '',
    countList: null
  };

  componentDidMount() {
    this.props.findPublicJobListing({ locationId: this.props.match.params.locationId });
  }

  selectJob = ({ id }) => {
    this.props.history.push(`/jobseeker/jobs/${id}`);
  };

  renderJob = job => {
    const { id, status, title, description, loading } = job;
    const { location_data } = this.props;
    var logo = null;
    if (!job || !job.images) {
      logo = defaultLogo;
    } else {
      const { images } = job;
      if (images.length > 0) {
        logo = images[0].thumbnail;
      } else {
        logo = helper.getWorkplaceLogo(location_data);
      }
    }
    const closed = status === 2 ? 'disabled' : '';

    return (
      <List.Item key={id} onClick={() => this.selectJob(job)} className={`${loading ? 'loading' : ''} ${closed}`}>
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={title}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        {closed && <Mark>Inactive</Mark>}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return <AlertMsg>No Job</AlertMsg>;
  };

  render() {
    const { jobs, location_data, error } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="Jobs" />

        <PageHeader>
          <h2>Jobs</h2>
        </PageHeader>

        <PageSubHeader>
          <Breadcrumb>
            <Breadcrumb.Item>{location_data ? location_data.business_data.name : ''}</Breadcrumb.Item>
            <Breadcrumb.Item>{location_data ? location_data.name : ''}</Breadcrumb.Item>
          </Breadcrumb>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={jobs}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
            error={error && 'Server Error!'}
          />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const { publicJobList, error } = state.js_find;
    return {
      jobs: publicJobList ? publicJobList[0].jobs : null,
      location_data: publicJobList ? publicJobList[0] : null,
      error
    };
  },
  {
    findPublicJobListing
  }
)(JSPublicWorkplaceList);
