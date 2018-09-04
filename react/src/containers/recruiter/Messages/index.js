import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Modal, Button, Switch, Drawer, notification } from 'antd';
import moment from 'moment';

import { getApplications, getJobs, getBusinesses } from 'redux/selectors';
import { updateApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { Loading, MessageThread, Icons, JobseekerDetails, LinkButton, JobDetails, Logo } from 'components';
import Sidebar from './Sidebar';
import Wrapper from './styled';

const { confirm } = Modal;

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
    const {
      applications,
      match: { params }
    } = nextProps;
    if (applications) {
      const {
        applications: applications0,
        match: { params: params0 }
      } = this.props;
      if (!applications0 || params0.appId !== params.appId) {
        this.setSelectedID(nextProps);
      }
    }
  }

  setSelectedID = ({ applications, match: { params } }) => {
    const appId = helper.str2int(params.appId) || helper.loadData('messages/appId');
    const app = helper.getItemByID(applications, appId) || applications[0] || {};
    helper.saveData('messages/appId', app.id);
    this.setState({ selectedId: app.id, open: false });
    this.props.history.replace(`/recruiter/messages/${app.id}`);
  };

  onConnect = ({ id, job_data }) => {
    const { businesses, history } = this.props;
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
        updateApplication({
          appId: id,
          data: {
            connect: DATA.APP.ESTABLISHED
          },
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The application is connected'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error connecting the application'
            });
          }
        });
      }
    });
  };

  onShortlist = ({ id, shortlisted }) => {
    this.props.updateApplication({
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
    const avatar = helper.getPitch(job_seeker).thumbnail;
    const jobseekerName = helper.getFullJSName(job_seeker);
    const jobName = helper.getFullBWName(job_data);
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
    const selectedApp = helper.getItemByID(applications, selectedId);

    return (
      <Wrapper tablet={tablet} open={open}>
        <Sidebar jobs={jobs} applications={applications} selectedId={selectedId} />

        <div className="body">
          <div className="header">
            {tablet && <Icons.Bars onClick={this.openSidebar} size="lg" />}
            {selectedApp && this.renderHeader(selectedApp)}
          </div>

          <div className="content">
            {selectedApp && <MessageThread application={selectedApp} inputRenderer={this.renderInput} />}
          </div>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        <Drawer placement="right" closable={false} onClose={this.hideAppDetails} visible={!!openAppDetails}>
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
        <Drawer placement="right" closable={false} onClose={this.hideJobDetails} visible={!!openJobDetails}>
          {openJobDetails && <JobDetails jobData={selectedApp.job_data} />}
        </Drawer>
      </Wrapper>
    );
  }
}

const enhance = connect(
  state => ({
    jobs: getJobs(state),
    applications: getApplications(state),
    businesses: getBusinesses(state)
  }),
  {
    updateApplication
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Page {...params} />
  </Fragment>
));
