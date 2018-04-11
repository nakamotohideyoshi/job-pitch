import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal } from 'antd';

import { getApplications, removeApplication } from 'redux/recruiter/apps';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, Logo, Icons } from 'components';
import Header from '../Header';
import Detail from '../MyConnections/Detail';
import Wrapper from './styled';

const { confirm } = Modal;

class MyApplications extends React.Component {
  state = {
    currentPage: 1
  };

  componentWillMount() {
    this.jobId = helper.str2int(this.props.match.params.jobId);
    this.getApplications(true);
  }

  componentWillReceiveProps({ match }) {
    const jobId = helper.str2int(match.params.jobId);
    if (this.jobId !== jobId) {
      this.jobId = jobId;
      this.getApplications();
    }
  }

  getApplications = clear => {
    if (this.jobId) {
      this.props.getApplications({
        jobId: this.jobId,
        status: DATA.APP.ESTABLISHED,
        shortlist: 1,
        clear
      });
    }
  };

  select = appId => this.props.history.push(`/recruiter/applications/shortlist/${this.jobId}/${appId}`);

  message = (id, e) => {
    e.stopPropagation();
    this.props.history.push(`/recruiter/messages/${id}`);
  };

  remove = (id, e) => {
    e.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplication({ id });
      }
    });
  };

  renderApplication = app => {
    const jobseeker = app.job_seeker;
    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);

    return (
      <List.Item
        key={jobseeker.id}
        actions={[
          <span onClick={e => this.message(app.id, e)}>Message</span>,
          <span onClick={e => this.remove(app.id, e)}>Remove</span>
        ]}
        onClick={() => this.select(app.id)}
      >
        <List.Item.Meta
          avatar={
            <span>
              <Logo src={image} size="80px" />
              {app.shortlisted && (
                <span className="star">
                  <Icons.Star />
                </span>
              )}
            </span>
          }
          title={`${fullName}`}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {jobseeker.description}
            </Truncate>
          }
        />
      </List.Item>
    );
  };

  renderApplications() {
    const { currentPage } = this.state;
    const { applications, loading, error, searchText } = this.props;

    if (error) {
      return (
        <AlertMsg>
          <span>Server Error!</span>
        </AlertMsg>
      );
    }

    if (applications.length === 0) {
      if (loading) {
        return (
          <AlertMsg>
            <Loading size="large" />
          </AlertMsg>
        );
      }

      return (
        <AlertMsg>
          <span>
            {`You have not shortlisted any applications for this job,
              turn off shortlist view to see the non-shortlisted applications.`}
          </span>
        </AlertMsg>
      );
    }

    const filteredApplications = applications.filter(
      ({ job_seeker }) =>
        helper
          .getFullJSName(job_seeker)
          .toLowerCase()
          .indexOf(searchText) >= 0
    );

    if (filteredApplications.length === 0) {
      return (
        <AlertMsg>
          <span>No search results</span>
        </AlertMsg>
      );
    }

    const pageSize = 10;
    const index = (currentPage - 1) * pageSize;
    const pageApplications = filteredApplications.slice(index, index + pageSize);
    const pagination = {
      pageSize,
      current: currentPage,
      total: filteredApplications.length,
      onChange: currentPage => this.setState({ currentPage })
    };

    return (
      <List
        itemLayout="horizontal"
        pagination={pagination}
        dataSource={pageApplications}
        loading={loading}
        renderItem={this.renderApplication}
      />
    );
  }

  render() {
    if (this.props.match.params.appId) {
      return <Detail mode="shortlist" />;
    }

    return (
      <Wrapper className="container">
        <Header />
        <div className="content">{this.renderApplications()}</div>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    applications: state.rc_apps.applications,
    loading: state.rc_apps.loadingApplications,
    error: state.rc_apps.errorApplications,
    searchText: state.rc_apps.searchText
  }),
  {
    getApplications,
    removeApplication
  }
)(MyApplications);
