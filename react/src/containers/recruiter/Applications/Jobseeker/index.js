import React from 'react';
import { connect } from 'react-redux';

import { Container, Loading, AlertMsg } from 'components';

import { getOpenedJobs, getJobseekers, getApplications } from 'redux/recruiter/apps';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

class RCJobseeker extends React.Component {
  componentWillMount() {
    this.props.getOpenedJobs({
      success: () => {
        const { jobs, match } = this.props;
        this.jobId = helper.str2int(match.params.jobId);
        const job = helper.getItemByID(jobs, this.jobId);
        if (job) {
          this.findJobseeker();
        } else {
          this.findTanlent();
        }
      }
    });
  }

  findJobseeker = () => {
    this.props.getJobseekers({
      jobId: this.jobId,
      success: () => {
        const { jobseekers, match, history } = this.props;
        this.jobseekerId = helper.str2int(match.params.jobseekerId);
        const jobseeker = helper.getItemByID(jobseekers, this.jobseekerId);
        if (jobseeker) {
          history.replace(`/recruiter/applications/find/${this.jobId}/${this.jobseekerId}`);
        } else {
          this.findApplication(DATA.APP.CREATED);
        }
      }
    });
  };

  findApplication = status => {
    this.props.getApplications({
      jobId: this.jobId,
      status: status,
      success: () => {
        const { applications, history } = this.props;
        const app = applications.filter(a => a.job_seeker.id === this.jobseekerId)[0];
        if (app) {
          const mode = status === DATA.APP.CREATED ? 'apps' : 'conns';
          history.replace(`/recruiter/applications/${mode}/${this.jobId}/${app.id}`);
          return;
        }

        if (status === DATA.APP.CREATED) {
          this.findApplication(DATA.APP.ESTABLISHED);
        } else {
          this.findTanlent();
        }
      }
    });
  };

  findTanlent = () => this.props.history.replace('/recruiter/applications/find');

  render() {
    return (
      <Container>
        {this.props.error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          <Loading size="large" />
        )}
      </Container>
    );
  }
}

export default connect(
  state => ({
    jobs: state.rc_apps.jobs,
    jobseekers: state.rc_apps.jobseekers,
    applications: state.rc_apps.applications,
    error: state.rc_apps.errorJobs || state.rc_apps.errorJobseekers || state.rc_apps.errorApplications
  }),
  {
    getOpenedJobs,
    getJobseekers,
    getApplications
  }
)(RCJobseeker);
