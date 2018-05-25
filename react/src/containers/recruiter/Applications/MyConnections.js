import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip, Button, Switch } from 'antd';

import { updateApplication, removeApplication } from 'redux/applications';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, LargeModal, JobseekerDetails } from 'components';

const { confirm } = Modal;

class MyConnections extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { tab, id } = this.props.location.state || {};
    if (tab === 'conns') {
      this.setState({ selectedId: id });
    }
  }

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/messages/${id}`);
  };

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplication({
          id,
          successMsg: {
            message: `Application is removed.`
          },
          failMsg: {
            message: `Removing is failed.`
          }
        });
      }
    });
  };

  onShortlist = ({ id, shortlisted }) => {
    this.props.updateApplication({
      id,
      data: {
        id,
        shortlisted: !shortlisted
      }
    });
  };

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
      <span>
        {this.props.shortlist
          ? `You have not shortlisted any applications for this job,
                       turn off shortlist view to see the non-shortlisted applications.`
          : `No candidates have applied for this job yet.
                       Once that happens, their applications will appear here.`}
      </span>
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
        {selectedApp && (
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
        )}
      </div>
    );
  }
}

export default withRouter(
  connect(null, {
    updateApplication,
    removeApplication
  })(MyConnections)
);
