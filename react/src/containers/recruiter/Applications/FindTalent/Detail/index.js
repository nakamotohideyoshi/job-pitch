import React from 'react';
import Helmet from 'react-helmet';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { PageHeader, Loading, AlertMsg, JobseekerDetail } from 'components';
import Container from './Wrapper';

import * as helper from 'utils/helper';
import { getJobseekers, connectJobseeker, removeJobseeker } from 'redux/recruiter/apps';

class TalentDetail extends React.Component {
  state = {
    jobseeker: null
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
    const { jobseekers } = this.props;
    const jobseeker = helper.getItemByID(jobseekers, this.jobId);
    if (jobseeker) {
      this.setState({ jobseeker });
    } else {
      console.log('-----', jobseekers, this.jobId);
      this.goBack();
    }
  };

  getBackUrl = () => `/recruiter/applications/find/${this.jobId}`;
  goBack = () => this.props.history.push(this.getBackUrl());

  render() {
    const { error } = this.props;
    const { jobseeker } = this.state;

    return (
      <Container>
        <Helmet title="Talent Detail" />

        <PageHeader>
          <h2>Talent Detail</h2>
          <Link to={this.getBackUrl()}>{'<< Back Talent List'}</Link>
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : !jobseeker ? (
          <Loading size="large" />
        ) : (
          <div className="content">
            <JobseekerDetail className="job-detail" jobseeker={jobseeker} />

            <div className="buttons">
              <Button type="primary" onClick={this.connectJobseeker}>
                Connect
              </Button>

              <Button onClick={this.removeJobseeker}>Remove</Button>
            </div>
          </div>
        )}
      </Container>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      jobseekers: state.rc_apps.jobseekers,
      loading: state.rc_apps.loading,
      error: state.rc_apps.error
    }),
    {
      getJobseekers,
      connectJobseeker,
      removeJobseeker
    }
  )(TalentDetail)
);
