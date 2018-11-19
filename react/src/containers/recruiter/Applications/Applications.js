import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { List, Modal, Tooltip, Button, Switch, Drawer, message, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { updateApplicationAction, removeApplicationAction } from 'redux/applications';
import { AlertMsg, Loading, ListEx, Icons, Logo, JobseekerDetails, Mark } from 'components';

const { confirm } = Modal;

const TYPE_NEW = 'apps';
const TYPE_CONNS = 'conns';
const TYPE_INTERVIEW = 'interviews';
const TYPE_OFFER = 'offered';
const TYPE_HIRE = 'hired';

/* eslint-disable react/prop-types */
class Applications extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { pathname, state } = this.props.location;
    this.type = pathname.split('/')[3];
    const { tab, id } = state || {};
    if (tab === this.type) {
      this.setState({ selectedId: id });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.applications.length != nextProps.applications.length) {
      const selectedApp = helper.getItemById(nextProps.applications, this.state.selectedId);
      !selectedApp && this.onSelect();
    }
  }

  onSelect = selectedId => {
    this.setState({ selectedId });
  };

  onConnect = ({ id }, event) => {
    event && event.stopPropagation();

    const business = this.props.job.location_data.business_data;

    if (business.tokens === 0) {
      confirm({
        title: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          this.props.history.push(`/recruiter/settings/credits/${business.id}`);
        }
      });
      return;
    }

    confirm({
      title: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.updateApplicationAction({
          appId: id,
          data: {
            connect: DATA.APP.ESTABLISHED
          },
          onSuccess: () => {
            message.success('The application is connected');
          },
          onFail: () => {
            message.error('There was an error connecting the application');
          }
        });
      }
    });
  };

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

  onOffer = ({ id }) => {
    this.props.updateApplicationAction({
      appId: id,
      data: {
        offer: true
      }
    });
  };

  onRevoke = ({ id }) => {
    this.props.updateApplicationAction({
      appId: id,
      data: {
        revoke: true
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
    const { id, job_seeker, interview, messages, loading, status } = app;
    const image = helper.getAvatar(job_seeker);
    const name = helper.getFullName(job_seeker);
    let description;
    const actions = [
      <Tooltip placement="bottom" title="Remove">
        <span onClick={e => this.onRemove(app, e)}>
          <Icons.Times />
        </span>
      </Tooltip>
    ];

    if (this.type === TYPE_NEW) {
      description = <div className="single-line">{job_seeker.description}</div>;
      actions.unshift(
        <Tooltip placement="bottom" title="Connect">
          <span onClick={e => this.onConnect(app, e)}>
            <Icons.Link />
          </span>
        </Tooltip>
      );
    }

    if (this.type === TYPE_CONNS) {
      description = interview && (
        <div className={`single-line ${interview.status}`}>
          Interview: {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
        </div>
      );
      if (messages.length) {
        actions.unshift(
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
        );
      }
    }

    if (this.type === TYPE_INTERVIEW) {
      const interview = app.interview || app.interviews.slice(-1)[0];
      let INTERVIEW_STATUS = {
        PENDING: 'Interview request sent',
        ACCEPTED: 'Interview accepted',
        COMPLETED: 'This interview is done',
        CANCELLED: `Interview cancelled by ${
          interview.cancelled_by === DATA.ROLE.RECRUITER ? 'Recruiter' : 'Jobseeker'
        }`
      };
      description = (
        <div className={`single-line ${interview.status}`} style={{ fontSize: '12px' }}>
          {`${INTERVIEW_STATUS[interview.status]} (${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')})`}
        </div>
      );
    }

    return (
      <List.Item key={id} actions={actions} onClick={() => this.onSelect(id)} className={loading ? 'loading' : ''}>
        <List.Item.Meta
          avatar={
            <span>
              {<Logo src={image} size="80px" />}
              {this.type === TYPE_CONNS && app.shortlisted && <Icons.Star />}
            </span>
          }
          title={name}
          description={description}
        />
        {status === DATA.APP.DECLINED && <Mark>Declined</Mark>}
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    if (this.type === TYPE_NEW) {
      return (
        <AlertMsg>
          <span>
            {`No applications at the moment. Once that happens you can go trough them here,
              shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
          </span>
        </AlertMsg>
      );
    }

    if (this.type === TYPE_CONNS) {
      return (
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
    }

    if (this.type === TYPE_INTERVIEW) {
      return (
        <AlertMsg>
          <span>
            {`You have not requested any interviews yet. Once that happens,
              their interviews will appear here.`}
          </span>
        </AlertMsg>
      );
    }

    return null;
  };

  render() {
    const { job, applications } = this.props;
    const selectedApp = helper.getItemById(applications, this.state.selectedId);
    const isExternalApp = !((selectedApp || {}).messages || []).length;

    return (
      <div className={this.type}>
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
                  {this.type === TYPE_NEW && (
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onConnect(selectedApp)}>
                      Connect
                    </Button>
                  )}

                  {this.type === TYPE_CONNS && (
                    <div style={{ marginBottom: '24px' }}>
                      <span style={{ marginRight: '5px' }}>Shortlisted</span>
                      <Switch
                        checked={selectedApp.shortlisted}
                        disabled={selectedApp.loading}
                        onChange={() => this.onShortlist(selectedApp)}
                      />
                    </div>
                  )}

                  {this.type !== TYPE_NEW && !isExternalApp && (
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

                  {(this.type === TYPE_CONNS || this.type === TYPE_INTERVIEW) && !isExternalApp && (
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onOffer(selectedApp)}>
                      Offer
                    </Button>
                  )}

                  {(this.type === TYPE_OFFER || this.type === TYPE_HIRE) && (
                    <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onRevoke(selectedApp)}>
                      Revoke
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
  )(Applications)
);
