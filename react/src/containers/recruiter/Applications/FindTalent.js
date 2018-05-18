import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip } from 'antd';

import { findJobseekers, connectJobseeker, removeJobseeker } from 'redux/recruiter/find';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, JobseekerDetails } from 'components';

const { confirm } = Modal;

class FindTalent extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { tab, id } = this.props.location.state || {};
    if (tab === 'find') {
      this.setState({ selectedId: id });
    }
  }

  findJobseekers = job => {
    const jobId = (job || this.props.job || {}).id;
    jobId &&
      this.props.findJobseekers({
        params: {
          job: jobId
        }
      });
  };

  onSelect = selectedId => this.setState({ selectedId });

  onConnect = ({ id }, event) => {
    event && event.stopPropagation();

    const { job } = this.props;
    const business = job.location_data.business_data;

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
      content: 'Are you sure you want to connect this talent? (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.connectJobseeker({
          data: {
            job: job.id,
            job_seeker: id
          },
          successMsg: {
            message: `Jobseeker is connected.`
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
      content: 'Are you sure you want to delete this talent?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJobseeker({
          id
        });
      }
    });
  };

  filterOption = jobseeker =>
    helper
      .getFullJSName(jobseeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderJobseeker = jobseeker => {
    const { id, description, loading } = jobseeker;
    const image = helper.getPitch(jobseeker).thumbnail;
    const name = helper.getFullJSName(jobseeker);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Connect">
            <span onClick={e => this.onConnect(jobseeker, e)}>
              <Icons.Link />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(jobseeker, e)}>
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
              {description}
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
        {`There are no more new matches for this job.
                  You can restore your removed matches by clicking refresh above.`}
      </span>
      <a onClick={() => this.findJobseekers()}>
        <Icons.Refresh />
        Refresh
      </a>
    </AlertMsg>
  );

  render() {
    const { job, jobseekers } = this.props;
    const selectedJobseeker = jobseekers && helper.getItemByID(jobseekers, this.state.selectedId);
    return (
      <div className="content">
        {job && (
          <ListEx
            data={jobseekers}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderJobseeker}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        {selectedJobseeker && (
          <JobseekerDetails
            title="Jobseeker Details"
            jobseeker={selectedJobseeker}
            onConnect={() => this.onConnect(selectedJobseeker)}
            onRemove={() => this.onRemove(selectedJobseeker)}
            onClose={() => this.onSelect()}
          />
        )}
      </div>
    );
  }
}

export default withRouter(
  connect(null, {
    findJobseekers,
    connectJobseeker,
    removeJobseeker
  })(FindTalent)
);
