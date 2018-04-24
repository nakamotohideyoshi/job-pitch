import React from 'react';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Modal, Avatar, Tooltip } from 'antd';

import { findJobseekers, connectJobseeker, removeJobseeker } from 'redux/recruiter/find';
import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons } from 'components';
import ApplicationDetails from 'containers/recruiter/ApplicationDetails';
import Header from '../Header';
import Wrapper from '../styled';

const { confirm } = Modal;

class FindTalent extends React.Component {
  state = {
    selectedId: null
  };

  componentWillMount() {
    const { location } = this.props;
    const { jobseekerId } = location.state || {};
    if (jobseekerId) {
      this.setState({ selectedId: jobseekerId });
    } else {
      this.findJobseekers();
    }
  }

  componentWillReceiveProps({ job }) {
    if (this.props.job !== job) {
      this.findJobseekers(job);
    }

    const { selectedId } = this.state;
    if (selectedId) {
      const { jobseekers } = this.props;
      const selectedJobseeker = jobseekers && helper.getItemByID(jobseekers, selectedId);
      !selectedJobseeker && this.onSelect();
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

    const { business, job, connectJobseeker, history } = this.props;
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
      content: 'Are you sure you want to connect this talent? (1 credit)',
      okText: `Connect`,
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        connectJobseeker({
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
      .indexOf(this.props.searchText.toLowerCase()) >= 0;

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
    const { job, jobseekers, error } = this.props;
    const selectedJobseeker = jobseekers && helper.getItemByID(jobseekers, this.state.selectedId);
    return (
      <Wrapper className="container">
        <Header />
        <div className="content">
          {job && (
            <ListEx
              data={jobseekers}
              loadingSize="large"
              pagination={{ pageSize: 10 }}
              filterOption={this.filterOption}
              error={error && 'Server Error!'}
              renderItem={this.renderJobseeker}
              emptyRender={this.renderEmpty}
            />
          )}
        </div>

        {selectedJobseeker && (
          <ApplicationDetails
            jobseeker={selectedJobseeker}
            onConnect={() => this.onConnect(selectedJobseeker)}
            onRemove={() => this.onRemove(selectedJobseeker)}
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
    const { jobseekers, error } = state.rc_find;
    const { searchText } = state.applications;

    return {
      business,
      job,
      jobseekers,
      error,
      searchText
    };
  },
  {
    findJobseekers,
    connectJobseeker,
    removeJobseeker
  }
)(FindTalent);
