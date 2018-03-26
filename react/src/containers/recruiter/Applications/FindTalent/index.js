import React from 'react';
import { connect } from 'react-redux';
import { List, Modal } from 'antd';
import { AlertMsg, Loading, Logo, Icons } from 'components';
import Header from '../Header';
import Detail from './Detail';
import Container from './Wrapper';

import { getJobseekers, connectJobseeker, removeJobseeker } from 'redux/recruiter/apps';
import * as helper from 'utils/helper';

const { confirm } = Modal;

class FindTalent extends React.Component {
  state = {
    currentPage: 1
  };

  componentWillMount() {
    this.refresh();
  }

  componentWillReceiveProps(nextProps) {
    const jobId = helper.str2int(nextProps.match.params.jobId);
    if (this.jobId !== jobId) {
      this.getJobseekers(jobId);
    }
  }

  refresh = () => {
    const jobId = helper.str2int(this.props.match.params.jobId);
    this.getJobseekers(jobId);
  };

  getJobseekers = jobId => {
    if (jobId) {
      this.jobId = jobId;
      this.props.getJobseekers({
        jobId
      });
    }
  };

  select = jobseekerId => this.props.history.push(`/recruiter/applications/find/${this.jobId}/${jobseekerId}`);

  connect = (id, e) => {
    e.stopPropagation();

    const { business, connectJobseeker, history } = this.props;

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
      title: 'Are you sure you want to connect this talent? (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        connectJobseeker({
          data: {
            job: this.jobId,
            job_seeker: id
          },
          onSuccess: this.refresh
        });
      }
    });
  };

  remove = (id, e) => {
    e.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this talent?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJobseeker({
          id
        });
      }
    });
  };

  renderJobseeker = jobseeker => {
    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);
    return (
      <List.Item
        key={jobseeker.id}
        actions={[
          <span onClick={e => this.connect(jobseeker.id, e)}>Connect</span>,
          <span onClick={e => this.remove(jobseeker.id, e)}>Remove</span>
        ]}
        onClick={() => this.select(jobseeker.id)}
      >
        <List.Item.Meta
          avatar={<Logo src={image} size="80px" />}
          title={`${fullName})`}
          description={jobseeker.description}
        />
      </List.Item>
    );
  };

  renderJobseekers() {
    const { loading, error, jobseekers, searchText } = this.props;
    const { currentPage } = this.state;

    if (error) {
      return (
        <AlertMsg>
          <span>Server Error!</span>
        </AlertMsg>
      );
    }

    if (jobseekers.length === 0) {
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
            {`There are no more new matches for this job.
              You can restore your removed matches by clicking refresh above.`}
          </span>
          <a onClick={this.refresh}>
            <Icons.Refresh />
            Refresh
          </a>
        </AlertMsg>
      );
    }

    const filteredJobseeksers = jobseekers.filter(
      jobseeker =>
        helper
          .getFullJSName(jobseeker)
          .toLowerCase()
          .indexOf(searchText) >= 0
    );

    if (filteredJobseeksers.length === 0) {
      return (
        <AlertMsg>
          <span>No search results</span>
        </AlertMsg>
      );
    }

    const pageSize = 10;
    const index = (currentPage - 1) * pageSize;
    const pageJobseekers = filteredJobseeksers.slice(index, index + pageSize);
    const pagination = {
      pageSize,
      current: currentPage,
      total: filteredJobseeksers.length,
      onChange: currentPage => this.setState({ currentPage })
    };

    return (
      <List
        itemLayout="horizontal"
        pagination={pagination}
        dataSource={pageJobseekers}
        loading={loading}
        renderItem={this.renderJobseeker}
      />
    );
  }

  render() {
    if (this.props.match.params.jobseekerId) {
      return <Detail />;
    }

    return (
      <Container>
        <Header />
        <div className="content">{this.renderJobseekers()}</div>
      </Container>
    );
  }
}

export default connect(
  state => ({
    business: state.rc_businesses.business,
    jobseekers: state.rc_apps.jobseekers,
    loading: state.rc_apps.loading,
    error: state.rc_apps.error,
    searchText: state.rc_apps.searchText,
    currentPage: state.rc_apps.currentPage
  }),
  {
    getJobseekers,
    connectJobseeker,
    removeJobseeker
  }
)(FindTalent);
