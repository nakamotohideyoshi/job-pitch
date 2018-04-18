import React from 'react';
import { connect } from 'react-redux';

import { findJobseekers } from 'redux/recruiter/find';
import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Loading, AlertMsg } from 'components';

class RCJobseeker extends React.Component {
  componentWillMount() {
    if (this.props.job) {
      this.findJobseekers();
    } else {
      this.goFind();
    }
  }

  componentWillReceiveProps({ job, jobseekers, jobseeker, applications, application, history }) {
    if (!this.props.jobseekers && jobseekers) {
      if (jobseeker) {
        history.replace(`/recruiter/applications/find/${job.id}/`, { jobseekerId: jobseeker.id });
      } else {
        this.getApplications();
      }
      return;
    }
    if (!this.props.applications && applications) {
      if (application) {
        if (application.status === DATA.APP.CREATED) {
          history.replace(`/recruiter/applications/apps/${job.id}/`, { applicationId: application.id });
          return;
        }
        if (application.status === DATA.APP.ESTABLISHED) {
          history.replace(`/recruiter/applications/conns/${job.id}/`, { applicationId: application.id });
          return;
        }
        this.goFind();
      }
    }
  }

  findJobseekers = () => {
    const { job, findJobseekers } = this.props;
    findJobseekers({
      params: {
        job: job.id
      }
    });
  };

  getApplications = () => {
    const { job, getApplications } = this.props;
    getApplications({
      params: {
        job: job.id
      }
    });
  };

  goFind = () => {
    this.props.history.replace('/recruiter/applications/find');
  };

  render() {
    return (
      <div className="container">
        {this.props.error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          <Loading size="large" />
        )}
      </div>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    const { jobseekers, error: error1 } = state.rc_find;
    const { applications, error: error2 } = state.applications;
    const jobseekerId = helper.str2int(match.params.jobseekerId);
    const jobseeker = helper.getItemByID(jobseekers || [], jobseekerId);
    const application = (applications || []).filter(({ job_seeker }) => job_seeker.id === jobseekerId)[0];
    return {
      job,
      jobseeker,
      jobseekers,
      application,
      applications,
      error: error1 || error2
    };
  },
  {
    findJobseekers,
    getApplications
  }
)(RCJobseeker);
