import React from 'react';
import { connect } from 'react-redux';

import { getApplications } from 'redux/selectors';
import { findJobs } from 'redux/jobseeker/find';
import * as helper from 'utils/helper';

import { Loading } from 'components';

class Jobs extends React.Component {
  componentWillMount() {
    this.props.findJobs();
  }

  componentWillReceiveProps({ jobs, job, applications, application, history }) {
    if (!this.props.jobs && jobs) {
      if (job) {
        history.replace(`/jobseeker/find/`, { jobId: job.id });
      } else if (application) {
        history.replace(`/jobseeker/applications/`, { appId: application.id });
      } else {
        history.replace(`/jobseeker/find`);
      }
    }
  }

  render() {
    return (
      <div className="container">
        <Loading size="large" />
      </div>
    );
  }
}

export default connect(
  (state, { match }) => {
    const { jobs } = state.js_find;
    const applications = getApplications(state);
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(jobs || [], jobId);
    const application = (applications || []).filter(({ job_data }) => job_data.id === jobId)[0];
    return {
      job,
      jobs,
      application,
      applications
    };
  },
  {
    findJobs
  }
)(Jobs);
