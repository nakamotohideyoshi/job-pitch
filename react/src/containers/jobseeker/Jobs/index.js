import React from 'react';
import { connect } from 'react-redux';

import { Container, Loading, AlertMsg } from 'components';
import { getJobs } from 'redux/jobseeker/find';
import { getApplications } from 'redux/jobseeker/myapps';

import * as helper from 'utils/helper';

class JSJobs extends React.Component {
  componentWillMount() {
    this.findJob();
  }

  findJob = () => {
    this.props.getJobs({
      success: jobs => {
        const { match, history } = this.props;
        const jobId = helper.str2int(match.params.jobId);
        const job = helper.getItemByID(jobs, jobId);
        if (job) {
          history.replace(`/jobseeker/find/${jobId}`);
        } else {
          this.findApp();
        }
      }
    });
  };

  findApp = () => {
    this.props.getApplications({
      success: apps => {
        const { match, history } = this.props;
        const jobId = helper.str2int(match.params.jobId);
        const app = apps.filter(app => app.job_data.id === jobId)[0];
        if (app) {
          history.replace(`/jobseeker/applications/${app.id}`);
        } else {
          history.replace(`/jobseeker/find`);
        }
      }
    });
  };

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
    error: state.js_find.error || state.js_myapps.error
  }),
  {
    getJobs,
    getApplications
  }
)(JSJobs);
