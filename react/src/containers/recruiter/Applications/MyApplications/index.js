import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal } from 'antd';

import { AlertMsg, Loading, Logo } from 'components';
import Header from '../Header';
import Detail from './Detail';
import Container from './Wrapper';

import { getApplications, connectApplication, removeApplication } from 'redux/recruiter/apps';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

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
        status: DATA.APP.CREATED,
        clear
      });
    }
  };

  select = appId => this.props.history.push(`/recruiter/applications/apps/${this.jobId}/${appId}`);

  connect = (id, e) => {
    e.stopPropagation();

    const { business, connectApplication, history } = this.props;

    if (business.tokens === 0) {
      confirm({
        title: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push(`/recruiter/settings/credits/${business.id}`);
        }
      });
      return;
    }

    confirm({
      title: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        connectApplication({
          id,
          data: {
            id,
            connect: DATA.APP.ESTABLISHED
          }
        });
      }
    });
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
          <span onClick={e => this.connect(app.id, e)}>Connect</span>,
          <span onClick={e => this.remove(app.id, e)}>Remove</span>
        ]}
        onClick={() => this.select(app.id)}
      >
        <List.Item.Meta
          avatar={<Logo src={image} size="80px" />}
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
            {`No applications at the moment. Once that happens you can go trough them here,
              shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
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
    if (this.props.match.params.applicationsId) {
      return <Detail />;
    }

    return (
      <Container>
        <Header />
        <div className="content">{this.renderApplications()}</div>
      </Container>
    );
  }
}

export default connect(
  state => ({
    business: state.rc_businesses.business,
    applications: state.rc_apps.applications,
    loading: state.rc_apps.loadingApplications,
    error: state.rc_apps.errorApplications,
    searchText: state.rc_apps.searchText
  }),
  {
    getApplications,
    connectApplication,
    removeApplication
  }
)(MyApplications);
