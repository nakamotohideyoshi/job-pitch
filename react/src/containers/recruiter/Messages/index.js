import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Modal, Avatar } from 'antd';

import { getApplications, connectApplication, updateApplication, sendMessage } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import {
  AlertMsg,
  Loading,
  MessageThread,
  Icons,
  JobseekerDetails,
  LinkButton,
  JobDetails,
  LargeModal
} from 'components';
import Sidebar from './Sidebar';
import Wrapper from './styled';

const { confirm } = Modal;

class Page extends React.Component {
  state = {
    selectedId: null,
    openAppDetails: false,
    openJobDetails: false,
    tablet: false,
    open: false
  };

  componentWillMount() {
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

  onConnect = ({ id, job_data }, event) => {
    event && event.stopPropagation();

    const { businesses, connectApplication, history } = this.props;
    const business = helper.getItemByID(businesses, job_data.location_data.business_data.id);
    if (business.tokens === 0) {
      confirm({
        content: 'You need 1 credit',
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
      content: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        connectApplication({
          id,
          data: {
            id,
            connect: DATA.APP.ESTABLISHED
          },
          successMsg: {
            message: `Application is connected.`
          },
          failMsg: {
            message: `Connection is failed.`
          }
        });
      }
    });
  };

  onShortlist = ({ id, shortlisted }) => {
    this.props.updateApplication({
      id,
      data: {
        id,
        shortlisted: !shortlisted
      }
    });
  };

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

  renderInput = selectedApp => {
    if (selectedApp.status === DATA.APP.CREATED) {
      return (
        <div>
          You cannot send messages until you have connected.
          <LinkButton onClick={this.showAppDetails}>Connect</LinkButton>
        </div>
      );
    }

    return null;
  };

  render() {
    const { jobs, applications, error } = this.props;

    if (error) {
      return <AlertMsg error>Server Error!</AlertMsg>;
    }
    if (!applications) {
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
                  inputRenderer={this.renderInput}
                />
              )}
            </div>
          </Fragment>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        {openAppDetails && (
          <JobseekerDetails
            title="Application Details"
            application={selectedApp}
            onShortlist={selectedApp.status === DATA.APP.ESTABLISHED ? () => this.onShortlist(selectedApp) : null}
            onConnect={selectedApp.status === DATA.APP.CREATED ? () => this.onConnect(selectedApp) : null}
            onClose={this.hideAppDetails}
          />
        )}
        {openJobDetails && (
          <LargeModal visible title="Job Details" onCancel={this.hideJobDetails}>
            <JobDetails job={selectedApp.job_data} />
          </LargeModal>
        )}
      </Wrapper>
    );
  }
}

const enhance = connect(
  state => ({
    jobs: state.rc_jobs.jobs,
    applications: state.applications.applications,
    businesses: state.rc_businesses.businesses,
    error: state.applications.error
  }),
  {
    getApplications,
    connectApplication,
    updateApplication,
    sendMessage
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Page {...params} />
  </Fragment>
));
