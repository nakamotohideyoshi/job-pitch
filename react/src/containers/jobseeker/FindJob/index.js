import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Truncate from 'react-truncate';
import { List, Avatar, Modal, Tooltip } from 'antd';

import { findJobs, applyJob, removeJob } from 'redux/jobseeker/find';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, Loading } from 'components';
import JobDetails from '../components/JobDetails';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

const { confirm } = Modal;

class FindJob extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { findJobs, location } = this.props;
    const { jobId } = location.state || {};
    if (jobId) {
      this.setState({ selectedId: jobId });
    } else {
      findJobs();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedId } = this.state;
    if (selectedId) {
      const { jobs } = this.props;
      const selectedJob = jobs && helper.getItemByID(jobs, selectedId);
      !selectedJob && this.onSelect();
    }
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = selectedId => this.setState({ selectedId });

  onApply = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Yes, I want to apply to this job',
      okText: 'Apply',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        const { jobseeker, applyJob } = this.props;
        applyJob({
          data: {
            job: id,
            job_seeker: jobseeker.id
          },
          successMsg: {
            message: `Job is applied.`
          },
          failMsg: {
            message: `Failed.`
          }
        });
      }
    });
  };

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you are not interested in this job?',
      okText: `I'm Sure`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJob({
          id
        });
      }
    });
  };

  filterOption = job => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getFullBWName(job);
    return job.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderJob = job => {
    const { id, title, contract, hours, description, location_data, loading } = job;
    const logo = helper.getJobLogo(job);
    const name = helper.getFullBWName(job);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const distance = helper.getDistanceFromLatLonEx(location_data, this.props.profile);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Apply">
            <span onClick={e => this.onApply(job, e)}>
              <Icons.Link />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(job, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${title} (${name})`}
          description={
            <Truncate lines={2} ellipsis={<span>...</span>}>
              {description}
            </Truncate>
          }
        />
        <div className="properties">
          <span style={{ width: '100px' }}>
            {contractName} / {hoursName}
          </span>
          <span style={{ width: '60px' }}>{distance}</span>
        </div>
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {`There are no more jobs that match your profile.
          You can restore your removed matches by clicking refresh.`}
      </span>
      <a onClick={() => this.props.findJobs()}>
        <Icons.Refresh />
        Refresh
      </a>
    </AlertMsg>
  );

  render() {
    const { jobseeker, jobs, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Find Me Jobs" />;
    }

    const selectedJob = jobs && helper.getItemByID(jobs, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="Find Me Jobs" />

        <PageHeader>
          <h2>Find Me Jobs</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={jobs}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
          />
        </div>

        {selectedJob && (
          <JobDetails
            job={selectedJob}
            onApply={() => this.onApply(selectedJob)}
            onRemove={() => this.onRemove(selectedJob)}
            onClose={() => this.onSelect()}
            roughLocation
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    profile: state.js_profile.profile,
    jobs: state.js_find.jobs,
    error: state.js_find.error
  }),
  {
    findJobs,
    applyJob,
    removeJob
  }
)(FindJob);
