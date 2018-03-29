import React from 'react';
import Helmet from 'react-helmet';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Modal, Switch } from 'antd';

import { PageHeader, Loading, AlertMsg, JobseekerDetail } from 'components';
import DATA from 'utils/data';
import Container from './Wrapper';

import * as helper from 'utils/helper';
import { getApplications, updateApplication, removeApplication } from 'redux/recruiter/apps';

const { confirm } = Modal;
class AppliaitonDetail extends React.Component {
  state = {
    application: null,
    shortlisted: false,
    shortlisting: false,
    removing: false
  };

  componentWillMount() {
    const { applications, match } = this.props;

    this.jobId = helper.str2int(match.params.jobId);

    if (applications.length) {
      this.getApplication();
    } else {
      this.getApplications(this.getApplication);
    }
  }

  getApplications = success => {
    const { getApplications, mode } = this.props;
    getApplications({
      jobId: this.jobId,
      status: DATA.APP.ESTABLISHED,
      shortlist: mode === 'shortlist' ? 1 : 0,
      success
    });
  };

  getApplication = () => {
    const { applications, match } = this.props;
    const appId = helper.str2int(match.params.appId);
    const application = helper.getItemByID(applications, appId);
    if (application) {
      this.setState({
        application,
        shortlisted: application.shortlisted
      });
    } else {
      this.goBack();
    }
  };

  goBack = () => {
    const { history, mode } = this.props;
    history.push(`/recruiter/applications/${mode}/${this.jobId}`);
  };

  message = () => this.props.history.push(`/recruiter/messages/${this.state.application.id}`);

  changeShortlisted = shortlisted => {
    const { application } = this.state;
    this.setState({ shortlisting: true });
    this.props.updateApplication({
      data: {
        id: application.id,
        shortlisted
      },
      success: () => {
        this.setState({ shortlisting: false, shortlisted });
        this.getApplications();
      },
      fail: () => this.setState({ shortlisting: false })
    });
  };

  remove = () => {
    const { id } = this.state.application;
    confirm({
      title: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.setState({ removing: true });
        this.props.removeApplication({
          id,
          success: this.goBack,
          fail: () => this.setState({ removing: false })
        });
      }
    });
  };

  renderDetail = () => {
    const { application, shortlisted, shortlisting, removing } = this.state;
    return (
      <div className="content">
        <JobseekerDetail className="job-detail" application={application} jobseeker={application.job_seeker} />

        <div className="buttons">
          <div>
            <span>Shortlisted</span>
            <Switch checked={shortlisted} loading={shortlisting} onChange={this.changeShortlisted} />
          </div>
          <Button type="primary" disabled={removing} onClick={this.message}>
            Message
          </Button>
          <Button loading={removing} onClick={this.remove}>
            Remove
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { error, mode } = this.props;
    const { application } = this.state;
    return (
      <Container>
        <Helmet title="Application Detail" />

        <PageHeader>
          <h2>Application Detail</h2>
          <Link to={`/recruiter/applications/${mode}/${this.jobId}`}>{'<< Back To List'}</Link>
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : !application ? (
          <AlertMsg>
            <Loading size="large" />
          </AlertMsg>
        ) : (
          this.renderDetail()
        )}
      </Container>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      applications: state.rc_apps.applications,
      error: state.rc_apps.errorApplications
    }),
    {
      getApplications,
      updateApplication,
      removeApplication
    }
  )(AppliaitonDetail)
);
