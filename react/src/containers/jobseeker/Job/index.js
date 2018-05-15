import React from 'react';
import { connect } from 'react-redux';

import { findJobs } from 'redux/jobseeker/find';
import { getApplications } from 'redux/applications';
import * as helper from 'utils/helper';

import { Loading, AlertMsg } from 'components';

class Jobs extends React.Component {
  componentWillMount() {
    this.props.findJobs();
  }

  componentWillReceiveProps({ jobs, job, applications, application, history }) {
    if (!this.props.jobs && jobs) {
      if (job) {
        history.replace(`/jobseeker/find/`, { jobId: job.id });
      } else {
        this.props.getApplications();
      }
      return;
    }

    if (!this.props.applications && applications) {
      if (application) {
        history.replace(`/jobseeker/applications/`, { appId: application.id });
      } else {
        history.replace(`/jobseeker/find`);
      }
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
    const { jobs, error: error1 } = state.js_find;
    const { applications, error: error2 } = state.applications;
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(jobs || [], jobId);
    const application = (applications || []).filter(({ job_data }) => job_data.id === jobId)[0];
    return {
      job,
      jobs,
      application,
      applications,
      error: error1 || error2
    };
  },
  {
    findJobs,
    getApplications
  }
)(Jobs);
