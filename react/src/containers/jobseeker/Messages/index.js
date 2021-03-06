import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { List, Drawer } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { getApplicationsSelector } from 'redux/selectors';
import { Loading, Icons, Logo, MessageThread, JobDetails } from 'components';
import Sidebar from './Sidebar';
import Wrapper from './styled';

/* eslint-disable react/prop-types */
class Messages extends React.Component {
  state = {
    selectedId: null,
    openJobDetails: false,
    defaultTab: null,
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
    this.props.history.replace(`/jobseeker/messages/${app.id}`);
  };

  onResize = () => {
    const tablet = window.innerWidth < 768;
    const open = !this.state.tablet && tablet ? false : this.state.open;
    this.setState({ tablet, open });
  };

  openSidebar = () => this.setState({ open: true });
  closeSidebar = () => this.setState({ open: false });
  showJobDetails = defaultTab => this.setState({ openJobDetails: true, defaultTab });
  hideJobDetails = () => this.setState({ openJobDetails: false, defaultTab: null });

  renderHeader = ({ job_data, interview, status }) => {
    const logo = helper.getJobLogo(job_data);
    const jobTitle = job_data.title;
    const subName = helper.getJobSubName(job_data);
    return (
      <List.Item>
        <List.Item.Meta
          avatar={<Logo src={logo} size="48px" padding="4px" />}
          title={
            <div>
              <span onClick={() => this.showJobDetails()}>{jobTitle}</span>
              {status === DATA.APP.ESTABLISHED && interview && (
                <span onClick={() => this.showJobDetails('history')}>
                  {`Interview: ${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}`}
                </span>
              )}
            </div>
          }
          description={<span onClick={() => this.showJobDetails('workplace')}>{subName}</span>}
        />
      </List.Item>
    );
  };

  renderInput = selectedApp => {
    if (!this.props.jobseeker.active) {
      return (
        <div>
          To message please activate your account.
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
    const { applications } = this.props;

    if (!applications) {
      return <Loading size="large" />;
    }

    const { selectedId, openJobDetails, defaultTab, tablet, open } = this.state;
    const selectedApp = helper.getItemById(applications, selectedId);

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
              {selectedApp && (
                <MessageThread
                  application={selectedApp}
                  inputRenderer={this.renderInput}
                  showInterview={() => this.showJobDetails('history')}
                />
              )}
            </div>
          </Fragment>
          {tablet && open && <span className="mask" onClick={this.closeSidebar} />}
        </div>

        <Drawer placement="right" onClose={this.hideJobDetails} visible={!!openJobDetails}>
          {openJobDetails && (
            <JobDetails
              application={selectedApp}
              roughLocation={selectedApp.status === DATA.APP.CREATED}
              defaultTab={defaultTab}
            />
          )}
        </Drawer>
      </Wrapper>
    );
  }
}

const enhance = connect(state => ({
  jobseeker: state.auth.jobseeker,
  applications: getApplicationsSelector(state)
}));

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Messages {...params} />
  </Fragment>
));
