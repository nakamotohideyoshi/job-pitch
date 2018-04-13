import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Avatar } from 'antd';

import { getJobs1 } from 'redux/recruiter/jobs';
import { getApplications, sendMessage } from 'redux/applications';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, MessageThread, Icons } from 'components';
import ApplicationDetails from 'containers/recruiter/ApplicationDetails';
import JobDetails from 'containers/recruiter/JobDetails';
import Sidebar from './Sidebar';
import Wrapper from './styled';

class Page extends React.Component {
  state = {
    selectedId: null,
    openAppDetails: false,
    openJobDetails: false,
    tablet: false,
    open: false
  };

  componentWillMount() {
    this.props.getJobs1();
    this.props.getApplications();

    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentWillReceiveProps(nextProps) {
    const { applications, match: { params } } = nextProps;
    if (applications) {
      const { applications: applications0, match: { params: params0 } } = this.props;
      if (!applications0 || params0.appId !== params.appId) {
        const appId = helper.str2int(params.appId) || helper.loadData('messages/appId');
        const app = helper.getItemByID(applications, appId) || applications[0] || {};
        helper.saveData('messages/appId', app.id);
        this.setState({ selectedId: app.id, open: false });
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

  onResize = () => {
    const tablet = window.innerWidth < 768;
    const open = !this.state.tablet && tablet ? false : this.state.open;
    this.setState({ tablet, open });
  };

  openSidebar = () => this.setState({ open: true });
  closeSidebar = () => this.setState({ open: false });
  showAppDetails = () => this.setState({ openAppDetails: true });
  hideAppDetails = () => this.setState({ openAppDetails: false });
  showJobDetails = () => this.setState({ openJobDetails: true });
  hideJobDetails = () => this.setState({ openJobDetails: false });

  renderHeader = ({ job_data, job_seeker }) => {
    const avatar = helper.getPitch(job_seeker).thumbnail;
    const jobseekerName = helper.getFullJSName(job_seeker);
    const jobName = helper.getFullBWName(job_data);
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar src={avatar} className="avatar-48" />}
          title={<span onClick={this.showAppDetails}>{jobseekerName}</span>}
          description={
            <span onClick={this.showJobDetails}>
              {job_data.title} ({jobName})
            </span>
          }
        />
      </List.Item>
    );
  };

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
    const { openAppDetails, openJobDetails, tablet, open } = this.state;

    return (
      <Wrapper tablet={tablet} open={open}>
        <Sidebar jobs={jobs} applications={applications} selectedId={selectedId} />

        <div className="body">
          <Fragment>
            <div className="header">
              {tablet && <Icons.Bars onClick={this.openSidebar} size="lg" />}
              {selectedApp && this.renderHeader(selectedApp)}
            </div>

            <div className="content">
              {selectedApp && (
                <MessageThread
                  userRole="RECRUITER"
                  application={selectedApp}
                  onSend={this.onSend}
                  onConnect={this.showAppDetails}
                />
              )}
            </div>
          </Fragment>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        {openAppDetails && <ApplicationDetails application={selectedApp} onClose={this.hideAppDetails} />}
        {openJobDetails && <JobDetails job={selectedApp.job_data} onClose={this.hideJobDetails} />}
      </Wrapper>
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
