import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Tooltip, Drawer } from 'antd';

import { removeInterview } from 'redux/interviews';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, InterviewEdit, Logo } from 'components';
import moment from 'moment';

const { confirm } = Modal;

class Interviews extends React.Component {
  state = {
    selectedId: null
    // selectedApp: null,
    // openInterviewEdit: false,
    // openInterviewView: false,
    // onlyNote: false
  };

  onSelect = selectedId => this.setState({ selectedId });

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

  editInterview = (app, rest, event) => {
    event && event.stopPropagation();
    if (rest) {
      this.setState({ selectedApp: app, openInterviewEdit: true, onlyNote: true });
    } else {
      this.setState({ selectedApp: app, openInterviewEdit: true, onlyNote: false });
    }
  };

  hideInterviewEdit = () => this.setState({ openInterviewEdit: false });

  hideInterviewView = () => this.setState({ openInterviewView: false });

  filterOption = application =>
    helper
      .getFullJSName(application.job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderApplication = app => {
    const { id, job_seeker, interview, loading } = app;
    const image = helper.getPitch(job_seeker).thumbnail;
    const name = helper.getFullJSName(job_seeker);

    const INTERVIEW_STATUS = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted'
    };
    let interviewStatus = INTERVIEW_STATUS[interview.status];

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Edit">
            <span onClick={e => this.editInterview(app, false, e)}>
              <Icons.Pen />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Logo src={image} size="80px" />}
          title={name}
          description={
            <Truncate lines={1} ellipsis={<span>...</span>}>
              {job_seeker.description}
            </Truncate>
          }
        />
        <span style={{ width: '180px' }}>
          <div>{interviewStatus}</div>
          <div>{moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}</div>
        </span>
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have not requested any interviews yet. Once that happens, their interviews will appear here.</span>
    </AlertMsg>
  );

  render() {
    const { job, applications } = this.props;
    const selectedApp = helper.getItemByID(applications, this.state.selectedId);
    return (
      <div className="interview">
        {job && (
          <ListEx
            data={applications}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderApplication}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <InterviewEdit
              jobseeker={selectedApp.job_seeker}
              connected
              application={selectedApp}
              gotoOrigin={this.hideInterviewView}
              view
            />
          )}
        </Drawer>

        {/* <Drawer
          placement="right"
          closable={false}
          onClose={() => this.hideInterviewEdit()}
          visible={selectedApp && this.state.openInterviewEdit}
        >
          {selectedApp &&
            this.state.openInterviewEdit && (
              <InterviewEdit
                jobseeker={selectedApp.job_seeker}
                connected
                application={selectedApp}
                gotoOrigin={this.hideInterviewEdit}
                onlyNote={this.state.onlyNote}
              />
            )}
        </Drawer> */}
      </div>
    );
  }
}

export default withRouter(
  connect(
    null,
    {
      removeInterview
    }
  )(Interviews)
);
