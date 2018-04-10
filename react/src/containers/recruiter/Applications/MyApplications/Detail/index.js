import React from 'react';
import Helmet from 'react-helmet';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Modal } from 'antd';

import { PageHeader, Loading, AlertMsg, JobseekerDetail } from 'components';
import DATA from 'utils/data';
import Wrapper from './Wrapper';

import * as helper from 'utils/helper';
import { getApplications, connectApplication, removeApplication } from 'redux/recruiter/apps';

const { confirm } = Modal;
class AppliaitonDetail extends React.Component {
  state = {
    application: null,
    connecting: false,
    removing: false
  };

  componentWillMount() {
    const { applications, getApplications, match } = this.props;

    this.jobId = helper.str2int(match.params.jobId);

    if (applications.length) {
      this.getApplication();
    } else {
      getApplications({
        jobId: this.jobId,
        status: DATA.APP.CREATED,
        success: this.getApplication
      });
    }
  }

  getApplication = () => {
    const { applications, match } = this.props;
    const appId = helper.str2int(match.params.appId);
    const application = helper.getItemByID(applications, appId);
    if (application) {
      this.setState({ application });
    } else {
      this.goBack();
    }
  };

  goBack = () => this.props.history.push(`/recruiter/applications/apps/${this.jobId}`);

  connect = () => {
    const { business, connectApplication, history } = this.props;
    const { id } = this.state.application;

    if (business.tokens === 0) {
      confirm({
        title: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push(`/recruiter/settings/credits/${business.id}`);
        }
      });
      return;
    }

    confirm({
      title: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.setState({ connecting: true });
        connectApplication({
          id,
          data: {
            id,
            connect: DATA.APP.ESTABLISHED
          },
          success: this.goBack,
          fail: () => this.setState({ connecting: false })
        });
      }
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
    const { application, connecting, removing } = this.state;
    return (
      <div className="content">
        <JobseekerDetail className="job-detail" jobseeker={application.job_seeker} />

        <div className="buttons">
          <Button type="primary" loading={connecting} disabled={removing} onClick={this.connect}>
            Connect
          </Button>
          <Button loading={removing} disabled={connecting} onClick={this.remove}>
            Remove
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { error } = this.props;
    const { application } = this.state;

    return (
      <Wrapper className="container">
        <Helmet title="Application Detail" />

        <PageHeader>
          <h2>Application Detail</h2>
          <Link to={`/recruiter/applications/apps/${this.jobId}`}>{'<< Back To List'}</Link>
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
      </Wrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      business: state.rc_businesses.business,
      applications: state.rc_apps.applications,
      error: state.rc_apps.errorApplications
    }),
    {
      getApplications,
      connectApplication,
      removeApplication
    }
  )(AppliaitonDetail)
);
