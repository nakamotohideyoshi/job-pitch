import React from 'react';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { List, Modal, Tooltip, Button, Drawer, message } from 'antd';

import * as helper from 'utils/helper';
import { findJobseekersAction, connectJobseekerAction, removeJobseekerAction } from 'redux/recruiter/find';
import { AlertMsg, Loading, ListEx, Icons, Logo, JobseekerDetails } from 'components';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
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

  findJobseekers = () => {
    const jobId = (this.props.job || {}).id;
    jobId &&
      this.props.findJobseekersAction({
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
      title: 'Are you sure you want to connect this talent? (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.connectJobseekerAction({
          data: {
            job: job.id,
            job_seeker: id
          },
          onSuccess: () => {
            message.success('The jobseeker is connected');
          },
          onFail: () => {
            message.error('There was an error connecting the jobseeker');
          }
        });
      }
    });
  };

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      title: 'Are you sure you want to delete this talent?',
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJobseekerAction({
          job: this.props.job.id,
          data: {
            job_seeker: id
          }
        });
      }
    });
  };

  filterOption = jobseeker =>
    helper
      .getFullName(jobseeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderJobseeker = jobseeker => {
    const { id, description, loading } = jobseeker;
    const avatar = helper.getAvatar(jobseeker);
    const name = helper.getFullName(jobseeker);

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
          description={<div className="single-line">{description}</div>}
        />
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    const { id, requires_cv, requires_pitch } = this.props.job || {};
    return (
      <AlertMsg>
        <span>There are no more new matches for this job.</span>
        <a onClick={this.findJobseekers}>
          <Icons.SyncAlt />
          Refresh
        </a>
        {requires_cv && <span>You are currently hiding job seekers who have not uploaded a CV</span>}
        {requires_pitch && <span>You are currently hiding job seekers who have not uploaded a video pitch</span>}
        {(requires_cv || requires_pitch) && <Link to={`/recruiter/jobs/job/edit/${id}`}>Remove filter</Link>}
      </AlertMsg>
    );
  };

  render() {
    const { job, jobseekers } = this.props;
    const selectedJobseeker = jobseekers && helper.getItemById(jobseekers, this.state.selectedId);

    return (
      <div>
        {job && (
          <ListEx
            data={jobseekers}
            renderItem={this.renderJobseeker}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        <Drawer placement="right" onClose={() => this.onSelect()} visible={!!selectedJobseeker}>
          {selectedJobseeker && (
            <JobseekerDetails
              jobseekerData={selectedJobseeker}
              actions={
                <div>
                  <Button
                    type="primary"
                    disabled={selectedJobseeker.loading}
                    onClick={() => this.onConnect(selectedJobseeker)}
                  >
                    Connect
                  </Button>
                  <Button
                    type="danger"
                    disabled={selectedJobseeker.loading}
                    onClick={() => this.onRemove(selectedJobseeker)}
                  >
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
      findJobseekersAction,
      connectJobseekerAction,
      removeJobseekerAction
    }
  )(FindTalent)
);
