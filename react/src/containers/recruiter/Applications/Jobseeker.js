import React from 'react';
import { connect } from 'react-redux';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getApplicationsSelector, getJobsSelector } from 'redux/selectors';
import { findJobseekersAction } from 'redux/recruiter/find';
import { Loading, AlertMsg } from 'components';

/* eslint-disable react/prop-types */
class RCJobseeker extends React.Component {
  componentWillMount() {
    const { job } = this.props;
    if (!job) {
      this.props.history.replace('/recruiter/applications/find');
      return;
    }

    this.props.findJobseekersAction({
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
    const job = helper.getItemById(getJobsSelector(state), jobId);

    const jobseekerId = helper.str2int(match.params.jobseekerId);

    const { jobseekers } = state.rc_find;
    const jobseeker = helper.getItemById(jobseekers || [], jobseekerId);

    const applications = getApplicationsSelector(state);
    const application = (applications || []).filter(
      ({ status, job_seeker }) => status !== DATA.APP.DELETED && job_seeker.id === jobseekerId
    )[0];
    return {
      job,
      jobseeker,
      jobseekers,
      application,
      applications
    };
  },
  {
    findJobseekersAction
  }
)(RCJobseeker);
