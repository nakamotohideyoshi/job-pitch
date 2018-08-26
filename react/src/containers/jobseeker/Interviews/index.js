import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Avatar, Tooltip, notification, Modal, Button, Drawer } from 'antd';
import moment from 'moment';

import { getApplications } from 'redux/applications';
import { getInterviews, removeInterview } from 'redux/interviews';
import { changeInterview } from 'redux/interviews';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo, Loading } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

import * as _ from 'lodash';

const { confirm } = Modal;

class JSInterviews extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    this.props.getInterviews();
    this.props.getApplications();
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${id}/`);
  };

  onAccept = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to accept this interview?',
      okText: `Accept`,
      okType: 'primary',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.changeInterview({
          data: {
            id,
            changeType: 'accept'
          },
          success: () => {
            this.setState({
              selectedApp: null
            });
            notification.success({
              message: 'Notification',
              description: 'Interview is accepted successfully.'
            });
          },
          fail: () => {
            this.setState({
              selectedApp: null
            });
            notification.error({
              message: 'Notification',
              description: 'Accepting is failed'
            });
          }
        });
      }
    });
  };

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to cancel this interview?',
      okText: `Yes`,
      okType: 'danger',
      cancelText: 'No',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          id,
          successMsg: {
            message: `Interview is cancelled.`
          },
          failMsg: {
            message: `Cancelling is failed.`
          }
        });
        this.setState({
          selectedApp: null
        });
      }
    });
  };

  filterOption = ({ application_data }) => {
    const { job_data } = application_data;
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getFullBWName(job_data);
    return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderInterview = interview => {
    const { at, application_data, status, loading } = interview;
    const { id, job_data } = application_data;
    const { title } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);

    const statusComments = {
      PENDING: 'Interview request received',
      ACCEPTED: 'Interview accepted',
      COMPLETED: 'This interview is done'
    };
    let statusComment = statusComments[status];
    if (status === 'CANCELLED') {
      const userRole = helper.getNameByID('roles', interview.cancelled_by);
      statusComment = `Interview cancelled by ${userRole === 'RECRUITER' ? 'Recruiter' : 'Job Seeker'}`;
    }

    let actions = [
      <Tooltip placement="bottom" title="Cancel Invitation">
        <span onClick={e => this.onRemove(interview, e)}>
          <Icons.Times />
        </span>
      </Tooltip>,
      <Tooltip placement="bottom" title="Message">
        <span onClick={e => this.onMessage(application_data, e)}>
          <Icons.CommentAlt />
        </span>
      </Tooltip>
    ];
    if (status === 'PENDING') {
      actions.unshift(
        <Tooltip placement="bottom" title="Accept Invitation">
          <span onClick={e => this.onRemove(interview, e)}>
            <Icons.Check />
          </span>
        </Tooltip>
      );
    }

    return (
      <List.Item
        key={id}
        actions={actions}
        onClick={() => this.onSelect(interview.id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" />} title={title} description={name} />
        <span style={{ width: '180px' }}>
          <div>{statusComment}</div>
          <div>{moment(at).format('ddd DD MMM, YYYY [at] H:mm')}</div>
        </span>
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no interviews.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, interviews, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Interviews" />;
    }

    const selectedInterview = interviews && helper.getItemByID(interviews, this.state.selectedId);
    const selectedApp = (selectedInterview || {}).application_data;

    return (
      <Wrapper className="container">
        <Helmet title="Interviews" />

        <PageHeader>
          <h2>Interviews</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={interviews}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderInterview}
            emptyRender={this.renderEmpty}
          />
        </div>

        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedInterview}>
          {selectedInterview && (
            <JobDetails
              job={selectedApp.job_data}
              actions={
                <div>
                  <Button type="primary" onClick={() => this.onMessage(selectedApp)}>
                    Message
                  </Button>
                  {selectedInterview.status === 'PENDING' && (
                    <Button type="primary" onClick={() => this.onAccept(selectedInterview)}>
                      Accept Invitation
                    </Button>
                  )}
                  <Button type="danger" onClick={e => this.onRemove(selectedInterview)}>
                    Cancel Invitation
                  </Button>
                </div>
              }
            />
          )}
        </Drawer>

        {/*
        {selectedRest && (
          <LargeModal
            visible
            title="Completed and Cancelled Interview List"
            onCancel={() => this.setState({ selectedRest: null })}
          >
            <Wrapper className="container">
              <div className="content">
                <ListEx
                  data={selectedRest}
                  loadingSize="large"
                  pagination={{ pageSize: 10 }}
                  filterOption={this.filterOption}
                  error={error && 'Server Error!'}
                  renderItem={this.renderApp}
                  emptyRender={this.renderEmpty}
                />
              </div>
            </Wrapper>
          </LargeModal>
        )} */}
      </Wrapper>
    );
  }
}

export default connect(
  state => {
    const { applications } = state.applications;
    const { interviews } = state.interviews;
    const interviews1 =
      applications &&
      interviews &&
      interviews.map(interview => ({
        ...interview,
        application_data: helper.getItemByID(applications, interview.application)
      }));
    const openingInterviews =
      interviews1 && interviews1.filter(({ status }) => status === 'PENDING' || status === 'ACCEPTED');

    return {
      jobseeker: state.js_profile.jobseeker,
      interviews: openingInterviews,
      error: state.applications.error || state.interviews.error
    };
  },
  {
    getApplications,
    getInterviews,
    changeInterview,
    removeInterview
  }
)(JSInterviews);
