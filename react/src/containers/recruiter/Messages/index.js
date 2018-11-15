import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import moment from 'moment';
import { List, Modal, Button, Switch, Drawer, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getApplicationsSelector, getJobsSelector } from 'redux/selectors';
import { updateApplicationAction } from 'redux/applications';
import { Loading, Icons, LinkButton, Logo, MessageThread, JobseekerDetails, JobDetails } from 'components';
import Sidebar from './Sidebar';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class Page extends React.Component {
  state = {
    selectedId: null,
    openAppDetails: false,
    openJobDetails: false,
    viewInterview: false,
    tablet: false,
    open: false
  };

  componentWillMount() {
    window.addEventListener('resize', this.onResize);
    this.onResize();

    if (this.props.applications) {
      this.setSelectedID(this.props);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  componentWillReceiveProps(nextProps) {
    const { applications, match } = nextProps;
    if (applications) {
      const { applications: applications0, match: match0 } = this.props;
      if (!applications0 || match0.params.appId !== match.params.appId) {
        this.setSelectedID(nextProps);
      }
    }
  }

  setSelectedID = ({ applications, match: { params } }) => {
    const appId = helper.str2int(params.appId) || helper.loadData('msgs_appId');
    const app = helper.getItemById(applications, appId) || applications[0] || {};
    helper.saveData('msgs_appId', app.id);
    this.setState({ selectedId: app.id, open: false });
    this.props.history.replace(`/recruiter/messages/${app.id}`);
  };

  onConnect = ({ id, job_data }) => {
    const { updateApplicationAction, businesses, history } = this.props;
    const business = helper.getItemById(businesses, job_data.location_data.business_data.id);

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
        updateApplicationAction({
          appId: id,
          data: {
            connect: DATA.APP.ESTABLISHED
          },
          onSuccess: () => {
            message.success('The application is connected');
          },
          onFail: () => {
            message.error('There was an error connecting the application');
          }
        });
      }
    });
  };

  onShortlist = ({ id, shortlisted }) => {
    this.props.updateApplicationAction({
      appId: id,
      data: {
        shortlisted: !shortlisted
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
  showAppDetails = viewInterview => this.setState({ openAppDetails: true, viewInterview });
  hideAppDetails = () => this.setState({ openAppDetails: false, viewInterview: false });
  showJobDetails = () => this.setState({ openJobDetails: true });
  hideJobDetails = () => this.setState({ openJobDetails: false });

  renderHeader = ({ job_data, job_seeker, interview, status }) => {
    const avatar = helper.getAvatar(job_seeker);
    const jobseekerName = helper.getFullName(job_seeker);
    const jobName = helper.getJobSubName(job_data);
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Logo src={avatar} size="48px" />}
          title={
            <div>
              <span onClick={() => this.showAppDetails()}>{jobseekerName}</span>
              {status === DATA.APP.ESTABLISHED && (
                <span onClick={() => this.showAppDetails(true)}>
                  {interview
                    ? `Interview: ${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}`
                    : 'Arrange Trial/Interview'}
                </span>
              )}
            </div>
          }
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
          <LinkButton onClick={() => this.showAppDetails()}>Connect</LinkButton>
        </div>
      );
    }

    return null;
  };

  render() {
    const { jobs, applications } = this.props;

    if (!applications) {
      return <Loading size="large" />;
    }

    const { selectedId, openAppDetails, openJobDetails, tablet, open, viewInterview } = this.state;
    const selectedApp = helper.getItemById(applications, selectedId);

    return (
      <Wrapper tablet={tablet} open={open}>
        <Sidebar jobs={jobs} applications={applications} selectedId={selectedId} />

        <div className="body">
          <div className="header">
            {tablet && <Icons.Bars onClick={this.openSidebar} size="lg" />}
            {selectedApp && this.renderHeader(selectedApp)}
          </div>

          <div className="content">
            {selectedApp && (
              <MessageThread
                application={selectedApp}
                inputRenderer={this.renderInput}
                showInterview={() => this.showAppDetails(true)}
              />
            )}
          </div>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        <Drawer placement="right" onClose={this.hideAppDetails} visible={!!openAppDetails}>
          {openAppDetails && (
            <JobseekerDetails
              application={selectedApp}
              defaultTab={viewInterview && 'interview'}
              actions={
                <div>
                  {selectedApp.status === DATA.APP.ESTABLISHED && (
                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ marginRight: '5px' }}>Shortlisted</span>
                      <Switch
                        checked={selectedApp.shortlisted}
                        loading={selectedApp.loading}
                        onChange={() => this.onShortlist(selectedApp)}
                      />
                    </div>
                  )}
                  {selectedApp.status === DATA.APP.CREATED && (
                    <Button type="primary" loading={selectedApp.loading} onClick={() => this.onConnect(selectedApp)}>
                      Connect
                    </Button>
                  )}
                </div>
              }
            />
          )}
        </Drawer>
        <Drawer placement="right" onClose={this.hideJobDetails} visible={!!openJobDetails}>
          {openJobDetails && <JobDetails jobData={selectedApp.job_data} />}
        </Drawer>
      </Wrapper>
    );
  }
}

const enhance = connect(
  state => {
    let applications = getApplicationsSelector(state);
    applications = applications.filter(({ messages }) => messages.length);
    return {
      jobs: getJobsSelector(state),
      applications,
      businesses: state.businesses.businesses
    };
  },
  {
    updateApplicationAction
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Page {...params} />
  </Fragment>
));
