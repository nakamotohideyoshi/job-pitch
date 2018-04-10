import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Layout, List, Avatar } from 'antd';

import { getJobs1 } from 'redux/recruiter/jobs';
import { getApplications, sendMessage } from 'redux/applications';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, MessageThread } from 'components';
import ApplicationDetails from 'containers/recruiter/ApplicationDetails';
import JobDetails from 'containers/recruiter/JobDetails';
import Sidebar from './Sidebar';
import StyledLayout from './styled';

class Page extends React.Component {
  state = {
    selectedId: null,
    openAppDetails: false,
    openJobDetails: false
  };

  componentWillMount() {
    this.props.getJobs1();
    this.props.getApplications();
  }

  componentWillReceiveProps(nextProps) {
    const { applications, match: { params } } = nextProps;
    if (applications) {
      const { applications: applications0, match: { params: params0 } } = this.props;
      if (!applications0 || params0.appId !== params.appId) {
        const appId = helper.str2int(params.appId) || helper.loadData('messages/appId');
        const app = helper.getItemByID(applications, appId) || applications[0] || {};
        helper.saveData('messages/appId', app.id);
        this.setState({ selectedId: app.id });
        this.props.history.replace(`/recruiter/messages/${app.id}`);
      }
    }
  }

  onSend = message => {
    this.props.sendMessage({
      id: new Date().getTime(),
      data: {
        application: this.state.selectedId,
        content: message
      }
    });
  };

  showAppDetails = () => this.setState({ openAppDetails: true });
  hideAppDetails = () => this.setState({ openAppDetails: false });
  showJobDetails = () => this.setState({ openJobDetails: true });
  hideJobDetails = () => this.setState({ openJobDetails: false });

  render() {
    const { error, jobs, applications } = this.props;

    if (error) {
      return <AlertMsg error>Server Error!</AlertMsg>;
    }
    if (!jobs || !applications) {
      return <Loading size="large" />;
    }

    const { selectedId } = this.state;
    const selectedApp = helper.getItemByID(applications, selectedId);
    const { job_data, job_seeker } = selectedApp;
    const avatar = helper.getPitch(job_seeker).thumbnail;
    const jobseekerName = helper.getFullJSName(job_seeker);
    const jobName = helper.getFullBWName(job_data);

    const { openAppDetails, openJobDetails } = this.state;

    return (
      <StyledLayout>
        <Sidebar jobs={jobs} applications={applications} selectedId={selectedId} />

        <Layout.Content>
          {selectedApp && (
            <Fragment>
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={avatar} />}
                  title={<span onClick={this.showAppDetails}>{jobseekerName}</span>}
                  description={
                    <span onClick={this.showJobDetails}>
                      {job_data.title} ({jobName})
                    </span>
                  }
                />
              </List.Item>
              <div className="content">
                <MessageThread
                  userRole="RECRUITER"
                  application={selectedApp}
                  onSend={this.onSend}
                  onConnect={this.showAppDetails}
                />
              </div>
            </Fragment>
          )}
        </Layout.Content>

        {openAppDetails && <ApplicationDetails application={selectedApp} onClose={this.hideAppDetails} />}
        {openJobDetails && <JobDetails job={job_data} onClose={this.hideJobDetails} />}
      </StyledLayout>
    );
  }
}

const enhance = connect(
  state => ({
    jobs: state.rc_jobs.jobs1,
    applications: state.applications.applications,
    error: state.rc_jobs.error1 || state.applications.error
  }),
  {
    getJobs1,
    getApplications,
    sendMessage
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Page {...params} />
  </Fragment>
));
