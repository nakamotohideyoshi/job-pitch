import React from 'react';
import { connect } from 'react-redux';

import { findJobseekers } from 'redux/recruiter/find';
import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Loading, AlertMsg } from 'components';

class RCJobseeker extends React.Component {
  componentWillMount() {
    const { job } = this.props;
    if (!job) {
      this.props.history.replace('/recruiter/applications/find');
      return;
    }

    this.props.findJobseekers({
      params: {
        job: job.id
      }
    });
    this.props.getApplications({
      params: {
        job: job.id
      }
    });
  }

  componentWillReceiveProps({ job, jobseekers, jobseeker, applications, application, history }) {
    if (jobseekers && applications) {
      if (jobseeker) {
        history.replace(`/recruiter/applications/find/${job.id}/`, { tab: 'find', id: jobseeker.id });
        return;
      }
      if (application) {
        if (application.status === DATA.APP.CREATED) {
          history.replace(`/recruiter/applications/apps/${job.id}/`, { tab: 'apps', id: application.id });
          return;
        }
        if (application.status === DATA.APP.ESTABLISHED) {
          history.replace(`/recruiter/applications/conns/${job.id}/`, { tab: 'conns', id: application.id });
          return;
        }
      }
      this.props.history.replace('/recruiter/applications/find');
    }
  }

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

    const jobseekerId = helper.str2int(match.params.jobseekerId);

    const { jobseekers, error: error1 } = state.rc_find;
    const jobseeker = helper.getItemByID(jobseekers || [], jobseekerId);

    const { applications, error: error2 } = state.applications;
    const application = (applications || []).filter(
      ({ status, job_seeker }) => status !== DATA.APP.DELETED && job_seeker.id === jobseekerId
    )[0];
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
