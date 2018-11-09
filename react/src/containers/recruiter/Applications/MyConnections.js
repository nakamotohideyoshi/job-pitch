import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { List, Modal, Tooltip, Button, Switch, Drawer, message, Badge } from 'antd';

import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { updateApplicationAction, removeApplicationAction } from 'redux/applications';
import { AlertMsg, Loading, ListEx, Icons, Logo, JobseekerDetails } from 'components';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
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

  onShortlist = ({ id, shortlisted }) => {
    this.props.updateApplicationAction({
      appId: id,
      data: {
        shortlisted: !shortlisted
      }
    });
  };

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this applicaton?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeApplicationAction({
          appId: id,
          onSuccess: () => {
            message.success('The application is removed');
          },
          onFail: () => {
            message.error('There was an error removing the application');
          }
        });
      }
    });
  };

  filterOption = ({ job_seeker }) =>
    helper
      .getFullName(job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderApplication = app => {
    const { id, job_seeker, interview, messages, loading } = app;
    const image = helper.getAvatar(job_seeker);
    const name = helper.getFullName(job_seeker);

    const actions = [
      <Tooltip placement="bottom" title="Remove">
        <span onClick={e => this.onRemove(app, e)}>
          <Icons.Times />
        </span>
      </Tooltip>
    ];
    if (messages.length) {
      actions.unshift(
        <Tooltip placement="bottom" title="Message">
          <span onClick={e => this.onMessage(app, e)}>
            <Icons.CommentAlt />
          </span>
        </Tooltip>
      );
    }

    return (
      <List.Item key={id} actions={actions} onClick={() => this.onSelect(id)} className={loading ? 'loading' : ''}>
        <List.Item.Meta
          avatar={
            <span>
              {<Logo src={image} size="80px" />}
              {app.shortlisted && <Icons.Star />}
            </span>
          }
          title={name}
          description={
            interview && (
              <div className={`single-line ${interview.status}`}>
                Interview: {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
              </div>
            )
          }
        />
        {loading && <Loading className="mask" />}
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
    const selectedApp = helper.getItemById(applications, this.state.selectedId);
    return (
      <div>
        {job && (
          <ListEx
            data={applications}
            renderItem={this.renderApplication}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        <Drawer placement="right" onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobseekerDetails
              application={selectedApp}
              defaultTab="interview"
              actions={
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <span style={{ marginRight: '5px' }}>Shortlisted</span>
                    <Switch
                      checked={selectedApp.shortlisted}
                      disabled={selectedApp.loading}
                      onChange={() => this.onShortlist(selectedApp)}
                    />
                  </div>

                  {selectedApp.messages.length > 0 && (
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                      Message
                      {selectedApp.newMsgs > 0 && (
                        <Badge
                          count={selectedApp.newMsgs > 9 ? '9+' : selectedApp.newMsgs}
                          style={{ backgroundColor: colors.yellow, marginLeft: '8px' }}
                        />
                      )}
                    </Button>
                  )}

                  <Button type="danger" disabled={selectedApp.loading} onClick={() => this.onRemove(selectedApp)}>
                    Remove
                  </Button>
                </div>
              }
            />
          )}
        </Drawer>
      </div>
    );
  }
}

export default withRouter(
  connect(
    null,
    {
      updateApplicationAction,
      removeApplicationAction
    }
  )(MyConnections)
);
