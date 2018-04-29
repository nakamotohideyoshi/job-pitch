import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal, Avatar } from 'antd';

import { getApplications, connectApplication, removeApplication } from 'redux/applications';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, JobseekerDetails } from 'components';
import Header from '../Header';
import Wrapper from '../styled';

const { confirm } = Modal;

class MyApplications extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    } else {
      this.getApplications();
    }
  }

  componentWillReceiveProps({ job }) {
    if (this.props.job !== job) {
      this.getApplications(job);
    }

    const { selectedId } = this.state;
    if (selectedId) {
      const { applications } = this.props;
      const selectedApp = applications && helper.getItemByID(applications, selectedId);
      !selectedApp && this.onSelect();
    }
  }

  getApplications = job => {
    const jobId = (job || this.props.job || {}).id;
    jobId &&
      this.props.getApplications({
        params: {
          job: jobId,
          status: DATA.APP.CREATED
        }
      });
  };

  onSelect = selectedId => this.setState({ selectedId });

  onConnect = ({ id }, event) => {
    event && event.stopPropagation();

    const { business, connectApplication, history } = this.props;
    if (business.tokens === 0) {
      confirm({
        content: 'You need 1 credit',
        okText: `Credits`,
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push(`/recruiter/settings/credits/${business.id}`);
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
        connectApplication({
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

  filterOption = ({ job_seeker }) =>
    helper
      .getFullJSName(job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText.toLowerCase()) >= 0;

  renderApplication = app => {
    const { id, job_seeker, loading } = app;
    const image = helper.getPitch(job_seeker).thumbnail;
    const name = helper.getFullJSName(job_seeker);

    return (
      <List.Item
        key={id}
        actions={[
          <span onClick={e => this.onConnect(app, e)}>
            <Icons.Link />
          </span>,
          <span onClick={e => this.onRemove(app, e)}>
            <Icons.TrashAlt />
          </span>
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
    const { job, applications, error } = this.props;
    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Header />
        <div className="content">
          {job && (
            <ListEx
              data={applications}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              filterOption={this.filterOption}
              error={error}
              renderItem={this.renderApplication}
              emptyRender={this.renderEmpty}
            />
          )}
        </div>

        {selectedApp && (
          <JobseekerDetails
            title="Application Details"
            application={selectedApp}
            onConnect={() => this.onConnect(selectedApp)}
            onRemove={() => this.onRemove(selectedApp)}
            onClose={() => this.onSelect()}
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const { businesses, selectedId } = state.rc_businesses;
    const business = helper.getItemByID(businesses || [], selectedId);

    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    const { applications, error, searchText } = state.applications;

    return {
      business,
      job,
      applications: applications ? applications.filter(({ status }) => status === DATA.APP.CREATED) : null,
      error,
      searchText
    };
  },
  {
    getApplications,
    connectApplication,
    removeApplication
  }
)(MyApplications);
