import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip } from 'antd';

import { removeInterview } from 'redux/interviews';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, LargeModal, InterviewEdit } from 'components';

const { confirm } = Modal;

class Interviews extends React.Component {
  state = {
    selectedId: null,
    openInterviewEdit: false,
    openInterviewView: false
  };

  componentWillMount() {
    const { tab, id } = this.props.location.state || {};
    if (tab === 'conns') {
      this.setState({ selectedId: id });
    }
  }

  onSelect = selectedId => this.setState({ selectedId, openInterviewView: true });

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

  editInterview = ({ id }, event) => {
    event && event.stopPropagation();
    this.setState({ selectedId: id, openInterviewEdit: true });
  };

  hideInterviewEdit = () => this.setState({ openInterviewEdit: false });

  hideInterviewView = () => this.setState({ openInterviewView: false });

  filterOption = application =>
    helper
      .getFullJSName(application.job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderApplication = app => {
    const { id, job_seeker, loading } = app;
    const image = helper.getPitch(job_seeker).thumbnail;
    const name = helper.getFullJSName(job_seeker);

    return (
      <List.Item
        key={id}
        actions={[
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
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(app, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
        className={loading ? 'loading' : ''}
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
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {job_seeker.description}
            </Truncate>
          }
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have not requested any interviews yet. Once that happens, their applications will appear here.</span>
    </AlertMsg>
  );

  render() {
    const { job, applications } = this.props;
    const selectedApp = helper.getItemByID(applications, this.state.selectedId);
    return (
      <div className="content">
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
    );
  }
}

export default withRouter(
  connect(null, {
    removeInterview
  })(Interviews)
);
