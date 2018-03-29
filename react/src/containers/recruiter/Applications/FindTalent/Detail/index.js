import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { Button, Modal, Spin } from 'antd';

import { PageHeader, Loading, AlertMsg, JobseekerDetail } from 'components';
import Container from './Wrapper';

import * as helper from 'utils/helper';
import { getJobseekers, connectJobseeker, removeJobseeker } from 'redux/recruiter/apps';

const { confirm } = Modal;
class TalentDetail extends React.Component {
  state = {
    jobseeker: null,
    connecting: false
  };

  componentWillMount() {
    const { jobseekers, getJobseekers, match } = this.props;

    this.jobId = helper.str2int(match.params.jobId);

    if (jobseekers.length) {
      this.getJobseeker();
    } else {
      getJobseekers({
        jobId: this.jobId,
        success: this.getJobseeker
      });
    }
  }

  getJobseeker = () => {
    const { jobseekers, match } = this.props;
    const jobseekerId = helper.str2int(match.params.jobseekerId);
    const jobseeker = helper.getItemByID(jobseekers, jobseekerId);
    if (jobseeker) {
      this.setState({ jobseeker });
    } else {
      this.goBack();
    }
  };

  goBack = () => this.props.history.push(`/recruiter/applications/find/${this.jobId}`);

  connect = () => {
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
        this.setState({ connecting: true });
        connectJobseeker({
          data: {
            job: this.jobId,
            job_seeker: this.state.jobseeker.id
          },
          success: this.goBack,
          fail: () => this.setState({ connecting: false })
        });
      }
    });
  };

  remove = () => {
    const { id } = this.state.jobseeker;
    confirm({
      title: 'Are you sure you want to delete this talent?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJobseeker({ id });
        this.goBack();
      }
    });
  };

  renderDetail = () => {
    const { jobseeker, connecting } = this.state;
    return (
      <div className="content">
        <JobseekerDetail className="job-detail" jobseeker={jobseeker} />

        <div className="buttons">
          <Button type="primary" loading={connecting} onClick={this.connect}>
            Connect
          </Button>
          <Button disabled={connecting} onClick={this.remove}>
            Remove
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { error, loading } = this.props;
    const { jobseeker } = this.state;

    return (
      <Container>
        <Helmet title="Talent Detail" />

        <PageHeader>
          <h2>Talent Detail</h2>
          <Link to={`/recruiter/applications/find/${this.jobId}`}>{'<< Back To List'}</Link>
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : !jobseeker ? (
          <AlertMsg>
            <Loading size="large" />
          </AlertMsg>
        ) : (
          this.renderDetail()
        )}
      </Container>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      business: state.rc_businesses.business,
      jobseekers: state.rc_apps.jobseekers,
      error: state.rc_apps.errorJobseekers
    }),
    {
      getJobseekers,
      connectJobseeker,
      removeJobseeker
    }
  )(TalentDetail)
);
