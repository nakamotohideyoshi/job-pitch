import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Avatar } from 'antd';

import { getApplications } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, MessageThread, Icons, JobDetails, LargeModal } from 'components';
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

  renderInput = selectedApp => {
    if (!this.props.jobseeker.active) {
      return (
        <div>
          {'To message please activate your account. '}
          <Link to="/jobseeker/settings/profile">Activate</Link>
        </div>
      );
    }

    if (selectedApp.status === DATA.APP.CREATED) {
      return <div>You cannot send message until your application is accepted.</div>;
    }

    return null;
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
              {selectedApp && <MessageThread application={selectedApp} inputRenderer={this.renderInput} />}
            </div>
          </Fragment>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        {openJobDetails && (
          <LargeModal visible title="Job Details" onCancel={this.hideJobDetails}>
            <JobDetails job={selectedApp.job_data} roughLocation={selectedApp.status === DATA.APP.CREATED} />
          </LargeModal>
        )}
      </Wrapper>
    );
  }
}

const enhance = connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: state.applications.applications,
    error: state.applications.error
  }),
  {
    getApplications
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Messages {...params} />
  </Fragment>
));
