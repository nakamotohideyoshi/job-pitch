import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip, Icon } from 'antd';

import { removeInterview } from 'redux/interviews';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, LargeModal, InterviewEdit } from 'components';
import moment from 'moment';
import Mark from './Mark';
import Wrapper from './styled';
import * as _ from 'lodash';

const { confirm } = Modal;

class Interviews extends React.Component {
  state = {
    selectedId: null,
    selectedApp: null,
    openInterviewEdit: false,
    openInterviewView: false,
    selectedRest: null
  };

  componentWillMount() {
    const { tab, id } = this.props.location.state || {};
    if (tab === 'conns') {
      this.setState({ selectedId: id });
    }
  }

  onSelect = app => this.setState({ selectedApp: app, openInterviewView: true });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/messages/${id}`);
  };

  onRemove = ({ interview }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to delete this interview?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeInterview({
          id: interview.id,
          successMsg: {
            message: `Interview is removed.`
          },
          failMsg: {
            message: `Removing is failed.`
          }
        });
      }
    });
  };

  editInterview = (app, event) => {
    event && event.stopPropagation();
    this.setState({ selectedApp: app, openInterviewEdit: true });
  };

  hideInterviewEdit = () => this.setState({ openInterviewEdit: false });

  hideInterviewView = () => this.setState({ openInterviewView: false });

  filterOption = application =>
    helper
      .getFullJSName(application.job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  onSelectRest = ({ id }, event) => {
    event && event.stopPropagation();
    let interviews = this.props.interviews;
    let filteredInterviews = [];
    interviews.forEach(interview => {
      if ((interview.status === 'COMPLETED' || interview.status === 'CANCELLED') && interview.application === id) {
        filteredInterviews.push(interview);
      }
    });
    const { applicationsB } = this.props;
    let myInterviews = [];
    _.forEach(filteredInterviews, interview => {
      _.forEach(applicationsB, application => {
        if (interview.application === application.id) {
          let applicationWithInterview = Object.assign({}, application);
          applicationWithInterview.interview = interview;
          myInterviews.push(applicationWithInterview);
        }
      });
    });
    this.setState({
      selectedRest: myInterviews
    });
  };

  renderApplication = app => {
    const { id, job_seeker, interview, loading } = app;
    const image = helper.getPitch(job_seeker).thumbnail;
    const name = helper.getFullJSName(job_seeker);
    let status = '';
    if (interview.status === 'PENDING') {
      status = 'Interview request sent';
    } else if (interview.status === 'ACCEPTED') {
      status = 'Interview accepted';
    } else if (interview.status === 'COMPLETED') {
      status = 'This interview is done';
    } else if (interview.status === 'CANCELLED') {
      const userRole = helper.getNameByID('roles', interview.cancelled_by);
      status = `Interview cancelled by ${userRole === 'RECRUITER' ? 'Recruiter' : 'Job Seeker'}`;
    }

    const cancelled = interview.status === 'CANCELLED' ? 'disabled' : '';

    return (
      <List.Item
        key={id}
        actions={
          this.state.selectedRest
            ? [
                <Tooltip placement="bottom" title="Message">
                  <span onClick={e => this.onMessage(app, e)}>
                    <Icons.CommentAlt />
                  </span>
                </Tooltip>,
                <Tooltip placement="bottom" title="Edit">
                  <span onClick={e => this.editInterview(app, e)}>
                    <Icons.Pen />
                  </span>
                </Tooltip>
              ]
            : [
                <Tooltip placement="bottom" title="Message">
                  <span onClick={e => this.onMessage(app, e)}>
                    <Icons.CommentAlt />
                  </span>
                </Tooltip>,
                <Tooltip placement="bottom" title="Edit">
                  <span onClick={e => this.editInterview(app, e)}>
                    <Icons.Pen />
                  </span>
                </Tooltip>,
                <Tooltip placement="bottom" title="Show Cancelled and Completed">
                  <span onClick={e => this.onSelectRest(app, e)}>
                    <Icon type="ellipsis" style={{ fontSize: '18px' }} />
                  </span>
                </Tooltip>
              ]
          // <Tooltip placement="bottom" title="Remove">
          //   <span onClick={e => this.onRemove(app, e)}>
          //     <Icons.TrashAlt />
          //   </span>
          // </Tooltip>
        }
        onClick={() => this.onSelect(app)}
        className={`${loading ? 'loading' : ''} ${cancelled}`}
      >
        <List.Item.Meta
          avatar={
            <span>
              <Avatar src={image} className="avatar-80" />
              {app.shortlisted && <Icons.Star />}
            </span>
          }
          title={name}
          description={
            <div>
              <div>
                <Truncate>{`Date: ${moment(interview.at).format('dddd, MMMM Do, YYYY h:mm:ss A')}`}</Truncate>
              </div>
              <div>
                <Truncate>{`Status: ${status}`}</Truncate>
              </div>
            </div>
          }
        />
        <div className="properties">asdf</div>
        {cancelled && <Mark>Cancelled</Mark>}
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have not requested any interviews yet. Once that happens, their applications will appear here.</span>
    </AlertMsg>
  );

  renderEmptyForCC = () => (
    <AlertMsg>
      <span>No Interviews.</span>
    </AlertMsg>
  );

  render() {
    const { job, applications, loading } = this.props;
    // const selectedApp = helper.getItemByID(applications, this.state.selectedId);
    const { selectedApp, selectedRest } = this.state;
    return (
      <Wrapper className="container">
        <div className="content">
          {job && !loading ? (
            <ListEx
              data={applications}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              renderItem={this.renderApplication}
              filterOption={this.filterOption}
              emptyRender={this.renderEmpty}
            />
          ) : (
            <Loading size="large" />
          )}
          {selectedApp &&
            this.state.openInterviewView && (
              <LargeModal visible title="Interview Detail" onCancel={this.hideInterviewView}>
                <InterviewEdit
                  jobseeker={selectedApp.job_seeker}
                  connected
                  application={selectedApp}
                  gotoOrigin={this.hideInterviewView}
                  view
                />
              </LargeModal>
            )}
          {selectedApp &&
            this.state.openInterviewEdit && (
              <LargeModal visible title="Interview Edit" onCancel={this.hideInterviewEdit}>
                <InterviewEdit
                  jobseeker={selectedApp.job_seeker}
                  connected
                  application={selectedApp}
                  gotoOrigin={this.hideInterviewEdit}
                />
              </LargeModal>
            )}
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
                    renderItem={this.renderApplication}
                    filterOption={this.filterOption}
                    emptyRender={this.renderEmptyForCC}
                  />
                </div>
              </Wrapper>
            </LargeModal>
          )}
          {/* {selectedApp && (
            <LargeModal visible title="Application Details" onCancel={() => this.onSelect()}>
              <JobseekerDetails
                jobseeker={selectedApp.job_seeker}
                connected
                actions={
                  <div>
                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ marginRight: '5px' }}>Shortlisted</span>
                      <Switch
                        checked={selectedApp.shortlisted}
                        loading={selectedApp.loading}
                        onChange={() => this.onShortlist(selectedApp)}
                      />
                    </div>
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                      Message
                    </Button>
                    <Button type="danger" disabled={selectedApp.loading} onClick={() => this.onRemove(selectedApp)}>
                      Remove
                    </Button>
                  </div>
                }
              />
            </LargeModal>
          )} */}
        </div>
      </Wrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      interviews: state.interviews.interviews,
      applicationsB: state.applications.applications
    }),
    {
      removeInterview
    }
  )(Interviews)
);
