import React from 'react';
import { connect } from 'react-redux';

import { findPublicJob } from 'redux/jobseeker/find';
// import * as helper from 'utils/helper';

import { Button } from 'antd';

import { Loading, AlertMsg, PublicJobDetails } from 'components';

class JSPublicJob extends React.Component {
  state = {
    job: null
  };

  componentWillMount() {
    this.props.findPublicJob({ jobId: this.props.match.params.jobId });
  }

  componentWillReceiveProps({ jobs }) {
    if (jobs) {
      this.setState({
        job: jobs[0]
      });
    }
  }

  renderComponent() {
    if (this.props.error) {
      return (
        <AlertMsg>
          <span>Server Error!</span>
        </AlertMsg>
      );
    }
    if (this.state.job) {
      return (
        <PublicJobDetails
          job={this.state.job}
          className="publicJobContainer"
          roughLocation
          actions={[
            <Button
              type="primary"
              key="1"
              onClick={() => {
                this.props.history.push(`/auth?redirect=${this.props.location.pathname}`);
              }}
            >
              Sign in
            </Button>,
            <Button
              type="primary"
              key="2"
              onClick={() => {
                this.props.history.push(`/auth/register`);
              }}
            >
              Register
            </Button>
          ]}
        />
      );
    } else {
      return <Loading size="large" />;
    }
  }

  render() {
    return <div className="container">{this.renderComponent()}</div>;
  }
}

export default connect(
  state => {
    const { jobs, error: error1 } = state.js_find;
    // const job = jobs[0];
    return {
      jobs,
      error: error1
    };
  },
  {
    findPublicJob
  }
)(JSPublicJob);
