import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Avatar } from 'antd';

import { getApplications, sendMessage } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, MessageThread, Icons } from 'components';
import JobDetails from '../components/JobDetails';
import Sidebar from './Sidebar';
import Wrapper from './styled';

class Messages extends React.Component {
  state = {
    selectedId: null,
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
        this.props.history.replace(`/jobseeker/messages/${app.id}`);
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
  showJobDetails = () => this.setState({ openJobDetails: true });
  hideJobDetails = () => this.setState({ openJobDetails: false });

  renderHeader = ({ job_data }) => {
    const avatar = helper.getJobLogo(job_data);
    const jobTitle = job_data.title;
    const subName = helper.getFullBWName(job_data);
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Avatar src={avatar} className="avatar-48" />}
          title={<span onClick={this.showJobDetails}>{jobTitle}</span>}
          description={<span onClick={this.showJobDetails}>{subName}</span>}
        />
      </List.Item>
    );
  };

  render() {
    const { error, applications } = this.props;

    if (error) {
      return <AlertMsg error>Server Error!</AlertMsg>;
    }
    if (!applications) {
      return <Loading size="large" />;
    }

    const { selectedId } = this.state;
    const selectedApp = helper.getItemByID(applications, selectedId);
    const { openJobDetails, tablet, open } = this.state;

    return (
      <Wrapper tablet={tablet} open={open}>
        <Sidebar applications={applications} selectedId={selectedId} />

        <div className="body">
          <Fragment>
            <div className="header">
              {tablet && <Icons.Bars onClick={this.openSidebar} size="lg" />}
              {selectedApp && this.renderHeader(selectedApp)}
            </div>

            <div className="content">
              {selectedApp && <MessageThread userRole="JOB_SEEKER" application={selectedApp} onSend={this.onSend} />}
            </div>
          </Fragment>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        {openJobDetails && (
          <JobDetails
            job={selectedApp.job_data}
            roughLocation={selectedApp.status === DATA.APP.CREATED}
            onClose={this.hideJobDetails}
          />
        )}
      </Wrapper>
    );
  }
}

const enhance = connect(
  state => ({
    applications: state.applications.applications,
    error: state.applications.error
  }),
  {
    getApplications,
    sendMessage
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Messages {...params} />
  </Fragment>
));
