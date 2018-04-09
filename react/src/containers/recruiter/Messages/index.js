import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Layout, List } from 'antd';

import { getData, sendMessage } from 'redux/recruiter/applications';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, MessageThread, Logo } from 'components';
import ApplicationDetails from 'containers/recruiter/ApplicationDetails';
import Sidebar from './Sidebar';
import StyledLayout from './styled';

class Page extends React.Component {
  state = {
    selectedId: null,
    appDetails: false,
    jobDetails: false
  };

  componentWillMount() {
    this.props.getData();
  }

  componentWillReceiveProps(nextProps) {
    const { applications, match } = nextProps;
    if (applications) {
      const { applications: applications0, match: match0 } = this.props;
      if (!applications0 || match0.params.appId !== match.params.appId) {
        const appId = helper.str2int(match.params.appId) || helper.loadData('messages/appId');
        const app = helper.getItemByID(applications, appId) || applications[0] || {};
        helper.saveData('messages/appId', app.id);
        this.setState({ selectedId: app.id });
        this.props.history.replace(`/recruiter/messages/${app.id}`);
      }
    }
  }

  onSend = message => {
    const { id } = this.state.selectedApp;
    this.props.sendMessage({
      id,
      data: {
        application: id,
        content: message
      }
    });
  };

  showAppDetails = () => this.setState({ appDetails: true });
  hideAppDetails = () => this.setState({ appDetails: false });
  showJobDetails = () => this.setState({ jobDetails: true });
  hideJobDetails = () => this.setState({ jobDetails: false });

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
    const image = helper.getPitch(job_seeker).thumbnail;
    const jsName = helper.getFullJSName(job_seeker);
    const jobInfo = helper.getFullBWName(job_data);

    const { appDetails } = this.state;

    return (
      <StyledLayout>
        <Sidebar jobs={jobs} applications={applications} selectedId={selectedId} />

        <Layout.Content>
          {selectedApp && (
            <Fragment>
              <List.Item>
                <List.Item.Meta
                  avatar={<Logo src={image} size="50px" />}
                  title={<span onClick={this.showAppDetails}>{jsName}</span>}
                  description={<span onClick={this.showJobDetails}>{jobInfo}</span>}
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

        {appDetails && <ApplicationDetails appId={selectedId} onClose={this.hideAppDetails} />}
        {/* {appDetails && <ApplicationDetails appId={selectedId} onClise={() => this.showAppDetails()} />} */}
      </StyledLayout>
    );
  }
}

const enhance = connect(
  state => ({
    jobs: state.rc_applications.jobs,
    applications: state.rc_applications.applications,
    error: state.rc_applications.error
  }),
  {
    getData,
    sendMessage
  }
);

export default enhance(params => (
  <Fragment>
    <Helmet title="My Messages" />
    <Page {...params} />
  </Fragment>
));
