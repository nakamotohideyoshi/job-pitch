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
    selectedJobseeker: null
  };

  componentWillMount() {
    const { jobseekers, location } = this.props;
    const { jobseekerId } = location.state || {};
    if (jobseekerId) {
      this.setState({
        selectedJobseeker: helper.getItemByID(jobseekers, jobseekerId)
      });
    } else {
      this.findJobseekers();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { job } = nextProps;
    if (this.props.job !== job) {
      this.findJobseekers(job);
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

  showDetails = selectedJobseeker => {
    this.setState({ selectedJobseeker });
  };

  hideDetails = () => {
    this.setState({ selectedJobseeker: null });
  };

  connect = ({ id }, event) => {
    event && event.stopPropagation();

    const { job, connectJobseeker, history } = this.props;

    const business = job.location_data.business_data;
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
          id,
          data: {
            job: this.jobId,
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

  remove = ({ id }, event) => {
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
    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);
    return (
      <List.Item
        key={jobseeker.id}
        actions={[
          <Tooltip placement="bottom" title="Connect">
            <span onClick={e => this.connect(jobseeker, e)}>
              <Icons.Link />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.remove(jobseeker, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.showDetails(jobseeker)}
        className={jobseeker.loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={image} className="avatar-80" />}
          title={fullName}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {jobseeker.description}
            </Truncate>
          }
        />
        {jobseeker.loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  render() {
    const { job, jobseekers, error } = this.props;
    const { selectedJobseeker } = this.state;
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
              error={error}
              renderItem={this.renderJobseeker}
              emptyRender={
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
              }
            />
          )}
        </div>

        {selectedJobseeker && <ApplicationDetails jobseeker={selectedJobseeker} onClose={this.hideDetails} />}
      </Wrapper>
    );
  }
}

export default connect(
  (state, { match }) => {
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(state.rc_jobs.jobs, jobId);
    const { jobseekers, error } = state.rc_find;
    const { searchText } = state.applications;
    return {
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
