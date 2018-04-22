import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Modal, Avatar } from 'antd';

import { findJobs, applyJob, removeJob } from 'redux/jobseeker/find';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, Loading, ListEx, Icons } from 'components';
import JobDetails from '../components/JobDetails';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

const { confirm } = Modal;

class FindJob extends React.Component {
  state = {
    filterText: '',
    selectedId: null
  };

  componentWillMount() {
    const { jobId } = this.props.location.state || {};
    if (jobId) {
      this.setState({ selectedId: jobId });
    } else {
      this.props.findJobs();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { selectedId } = this.state;
    const { jobs } = nextProps;
    if (selectedId && this.props.jobs !== jobs) {
      const job = jobs && helper.getItemByID(jobs, selectedId);
      !job && this.setState({ selectedId: null });
    }
  }

  onChangeFilterText = filterText => this.setState({ filterText });

  onSelectJob = selectedId => this.setState({ selectedId });

  onApplyJob = (jobId, event) => {
    event && event.stopPropagation();

    const { jobseeker, applyJob, history } = this.props;
    const pitch = helper.getPitch(jobseeker);
    if (pitch) {
      confirm({
        content: 'Yes, I want to apply to this job',
        okText: 'Apply',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          applyJob({
            data: {
              job: jobId,
              job_seeker: jobseeker.id
            }
          });
        }
      });
    } else {
      confirm({
        content: 'You need to record your pitch video to apply.',
        okText: 'Record my pitch',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/record');
        }
      });
    }
  };

  onRemoveJob = (jobId, event) => {
    event && event.stopPropagation();

    confirm({
      content: 'Are you sure you are not interested in this job?',
      okText: `I'm Sure`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJob({
          id: jobId
        });
      }
    });
  };

  filterOption = job => {
    const filterText = this.state.filterText.toLowerCase();
    const subName = helper.getFullBWName(job);
    return (
      !filterText || job.title.toLowerCase().indexOf(filterText) >= 0 || subName.toLowerCase().indexOf(filterText) >= 0
    );
  };

  renderJob = job => {
    const { title, description } = job;
    const logo = helper.getJobLogo(job);
    const subName = helper.getFullBWName(job);
    const contract = helper.getItemByID(DATA.contracts, job.contract).short_name;
    const hours = helper.getItemByID(DATA.hours, job.hours).short_name;
    const distance = helper.getDistanceFromLatLonEx(job.location_data, this.props.profile);
    return (
      <List.Item
        key={job.id}
        actions={[
          <span onClick={e => this.onApplyJob(job.id, e)}>Apply</span>,
          <span onClick={e => this.onRemoveJob(job.id, e)}>Remove</span>
        ]}
        onClick={() => this.onSelectJob(job.id)}
        className={job.loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Avatar src={logo} className="avatar-80" />}
          title={`${title} (${subName})`}
          description={
            <div>
              <div className="properties">
                <span>
                  {contract} / {hours}
                </span>
                <span>{distance}</span>
              </div>
              <div>{description}</div>
            </div>
          }
        />
        {job.loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  render() {
    const { jobseeker, jobs, error } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Find Me Jobs" />;
    }

    const { selectedId } = this.state;
    const selectedJob = jobs && helper.getItemByID(jobs, selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="Find Me Jobs" />

        <PageHeader>
          <h2>Find Me Jobs</h2>
          <SearchBox width="200px" onChange={this.onChangeFilterText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={jobs}
            error={error && 'Server Error!'}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            renderItem={this.renderJob}
            emptyRender={
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
            }
          />
        </div>

        {selectedJob && (
          <JobDetails
            job={selectedJob}
            onApply={() => this.onApplyJob(selectedId)}
            onRemove={() => this.onRemoveJob(selectedId)}
            onClose={() => this.onSelectJob()}
            roughLocation
          />
        )}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    profile: state.auth.profile,
    jobs: state.js_find.jobs,
    error: state.js_find.error
  }),
  {
    findJobs,
    applyJob,
    removeJob
  }
)(FindJob);
