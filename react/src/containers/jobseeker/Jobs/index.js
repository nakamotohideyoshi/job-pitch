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

  componentWillReceiveProps(nextPorps) {
    const { match, history } = this.props;
    const jobId = helper.str2int(match.params.jobId);
    const { jobs, applications } = nextPorps;
    if (!this.props.jobs && jobs) {
      const job = helper.getItemByID(jobs, jobId);
      if (job) {
        history.replace(`/jobseeker/find/`, { jobId });
      } else {
        this.props.getApplications();
      }
    } else if (!this.props.applications && applications) {
      const jobId = helper.str2int(match.params.jobId);
      const app = applications.filter(app => app.job_data.id === jobId)[0];
      console.log(jobId, applications, app);
      if (app) {
        history.replace(`/jobseeker/applications/`, { appId: app.id });
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
  state => ({
    jobs: state.js_find.jobs,
    applications: state.applications.applications,
    error: state.js_find.error || state.applications.error
  }),
  {
    findJobs,
    getApplications
  }
)(Jobs);
