import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip, Button } from 'antd';

import { connectApplication, removeApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, LargeModal, JobseekerDetails } from 'components';

const { confirm } = Modal;

class MyApplications extends React.Component {
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

    const { business } = this.props;
    if (business.tokens === 0) {
      confirm({
        content: 'You need 1 credit',
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
      content: 'Yes, I want to make this connection (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.connectApplication({
          id,
          data: {
            id,
            connect: DATA.APP.ESTABLISHED
          },
          successMsg: {
            message: `Application is connected.`
          },
          failMsg: {
            message: `Connection is failed.`
          }
        });
      }
    });
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
          <Tooltip placement="bottom" title="Connect">
            <span onClick={e => this.onConnect(app, e)}>
              <Icons.Link />
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
          avatar={<Avatar src={image} className="avatar-80" />}
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
        {`No applications at the moment. Once that happens you can go trough them here,
                shortlist and easy switch to Find Talent mode and "head hunt" as well.`}
      </span>
    </AlertMsg>
  );

  render() {
    const { job, applications } = this.props;
    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

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
                  <Button type="primary" loading={selectedApp.loading} onClick={() => this.onConnect(selectedApp)}>
                    Connect
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
    connectApplication,
    removeApplication
  })(MyApplications)
);
