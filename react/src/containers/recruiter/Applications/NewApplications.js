import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Tooltip, Button, Drawer, notification } from 'antd';

import { updateApplication, removeApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, JobseekerDetails, Logo } from 'components';

const { confirm } = Modal;

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
        this.props.updateApplication({
          appId: id,
          data: {
            connect: DATA.APP.ESTABLISHED
          },
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The application is connected'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error connecting the application'
            });
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
          appId: id,
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The application is removed'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error removing the application'
            });
          }
        });
      }
    });
  };

  filterOption = ({ job_seeker }) =>
    helper
      .getFullJSName(job_seeker)
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
          avatar={<Logo src={image} size="80px" />}
          title={name}
          description={
            <Truncate lines={1} ellipsis={<span>...</span>}>
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
      <div>
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
  connect(null, {
    updateApplication,
    removeApplication
  })(NewApplications)
);
