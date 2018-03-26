import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { Loading, PageHeader, AlertMsg, JobDetail } from 'components';
import Container from './Wrapper';
import NoPitch from '../NoPitch';

import * as helper from 'utils/helper';
import { getApplications } from 'redux/jobseeker/myapps';

class JSAppDetail extends React.Component {
  state = {
    app: null
  };

  componentWillMount() {
    const { applications, getApplications } = this.props;
    if (applications.length) {
      this.getApp();
    } else {
      getApplications({
        success: this.getApp
      });
    }
  }

  getApp = () => {
    const { match, applications } = this.props;
    const appId = helper.str2int(match.params.appId);
    const app = helper.getItemByID(applications, appId);
    if (app) {
      this.setState({ app });
    } else {
      this.goMyApps();
    }
  };

  goMyApps = () => this.props.history.push('/jobseeker/applications');

  render() {
    const { error, jobseeker } = this.props;
    const { app } = this.state;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" {...this.props} />;
    }

    return (
      <Container>
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>Application Detail</h2>
          <Link to="/jobseeker/applications">{'<< Back Application List'}</Link>
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : !app ? (
          <Loading size="large" />
        ) : (
          <div className="content">
            <JobDetail className="job-detail" job={app.job_data} />

            <div className="buttons">
              <Button type="primary" onClick={() => this.props.history.push(`/jobseeker/messages/${app.id}/`)}>
                Message
              </Button>
            </div>
          </div>
        )}
      </Container>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    applications: state.js_myapps.applications,
    error: state.js_myapps.error
  }),
  {
    getApplications
  }
)(JSAppDetail);
