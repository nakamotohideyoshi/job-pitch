import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Avatar, Tooltip, Button, notification } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/applications';
import { getInterviews } from 'redux/interviews';
import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { changeInterview } from 'redux/interviews';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, LargeModal, Loading } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

import * as _ from 'lodash';

class JSInterviews extends React.Component {
  state = {
    selectedId: null,
    searchText: '',
    selectedApp: null
  };

  componentWillMount() {
    const { getApplications, getInterviews, location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    } else {
      getApplications();
      getInterviews();
    }
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = app => this.setState({ selectedApp: app });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${id}/`);
  };

  acceptInvitation = ({ interview }, event) => {
    event && event.stopPropagation();
    this.props.changeInterview({
      data: {
        id: interview.id,
        changeType: 'accept'
      },
      success: () => {
        this.setState({
          selectedApp: null
        });
        notification.success({
          message: 'Notification',
          description: 'Interview is saved successfully.'
        });
      },
      fail: () => {
        this.setState({
          selectedApp: null
        });
        notification.error({
          message: 'Notification',
          description: 'Saving is failed'
        });
      }
    });
  };

  filterOption = ({ job_data }) => {
    // const searchText = this.state.searchText.toLowerCase();
    // const name = helper.getFullBWName(job_data);
    // return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
    return true;
  };

  renderApp = interview => {
    let app;
    _.forEach(this.props.applications, application => {
      if (interview.application === application.id) {
        let applicationWithInterview = Object.assign({}, application);
        applicationWithInterview.interview = interview;
        app = applicationWithInterview;
      }
    });
    const { id, job_data } = app;
    const { at } = interview;
    const { title, contract, hours, description } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;

    let status = '';
    if (interview.status === 'PENDING') {
      status = 'Interview request received';
    } else if (interview.status === 'ACCEPTED') {
      status = 'Interview accepted';
    } else if (interview.status === 'COMPLETED') {
      status = 'This interview is done';
    } else if (interview.status === 'CANCELLED') {
      status = 'Interview cancelled by ';
    }

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(app)}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${title} (${name})`}
          description={
            <div>
              <div>
                <Truncate>{`Date: ${moment(at).format('dddd, MMMM Do, YYYY h:mm:ss A')}`}</Truncate>
              </div>
              <div>
                <Truncate>{`Status: ${status}`}</Truncate>
              </div>
            </div>
          }
        />
        <div className="properties">
          <span>
            {contractName} / {hoursName}
          </span>
        </div>
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no applications.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, applications, interviews, error } = this.props;

    const { selectedApp } = this.state;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="New Applications" backUrl={this.props.history.location.pathname} />;
    }

    // const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="New Applications" />

        <PageHeader>
          <h2>Interviews</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          {applications !== null && interviews !== null ? (
            <ListEx
              data={interviews}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              filterOption={this.filterOption}
              error={error && 'Server Error!'}
              renderItem={this.renderApp}
              emptyRender={this.renderEmpty}
            />
          ) : (
            <Loading size="large" />
          )}
        </div>

        {selectedApp && (
          <LargeModal visible title="Job Details" onCancel={() => this.onSelect()}>
            <JobDetails
              job={selectedApp.job_data}
              actions={[
                <Button type="default" onClick={() => this.onMessage(selectedApp)}>
                  Message
                </Button>,
                <Button type="primary" onClick={() => this.acceptInvitation(selectedApp)}>
                  Accept Invitation
                </Button>
              ]}
            />
          </LargeModal>
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: state.applications.applications,
    interviews: state.interviews.interviews,
    error: state.applications.error
  }),
  {
    getApplications,
    getInterviews,
    changeInterview
  }
)(JSInterviews);
