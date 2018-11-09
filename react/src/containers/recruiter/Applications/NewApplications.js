import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { List, Modal, Tooltip, Button, Drawer, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { updateApplicationAction, removeApplicationAction } from 'redux/applications';
import { AlertMsg, Loading, ListEx, Icons, Logo, JobseekerDetails } from 'components';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class NewApplications extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { tab, id } = this.props.location.state || {};
    if (tab === 'apps') {
      this.setState({ selectedId: id });
    }
  }

  onSelect = selectedId => this.setState({ selectedId });

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
    const { id, job_seeker, loading } = app;
    const avatar = helper.getAvatar(job_seeker);
    const name = helper.getFullName(job_seeker);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Connect">
            <span onClick={e => this.onConnect(app, e)}>
              <Icons.Link />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(app, e)}>
              <Icons.Times />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Logo src={avatar} size="80px" />}
          title={name}
          description={<div className="single-line">{job_seeker.description}</div>}
        />
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {`No applications at the moment. Once that happens you can go trough them here,
          shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
      </span>
    </AlertMsg>
  );

  render() {
    const { job, applications } = this.props;
    const selectedApp = applications && helper.getItemById(applications, this.state.selectedId);
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
              actions={
                <div>
                  <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onConnect(selectedApp)}>
                    Connect
                  </Button>
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
  )(NewApplications)
);
