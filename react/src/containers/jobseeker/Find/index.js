import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { message, List, Modal, Spin } from 'antd';

import { Loading, PageHeader, SearchBox, AlertMsg, Icons } from 'components';
import Container from './Wrapper';
import NoPitch from '../NoPitch';

import * as helper from 'utils/helper';
import DATA from 'utils/data';
import { updateStatus, getJobs, applyJob, removeJob } from 'redux/jobseeker/find';

const { confirm } = Modal;

class FindJob extends React.Component {
  componentWillMount() {
    if (this.props.requestRefresh) {
      this.props.getJobs();
    }
  }

  selectJob = jobId => this.props.history.push(`/jobseeker/find/${jobId}/`);

  applyJob = (e, jobId) => {
    e.stopPropagation();

    const { jobseeker, applyJob, history } = this.props;
    const pitch = helper.getPitch(jobseeker);
    if (pitch) {
      confirm({
        title: 'Yes, I want to apply to this job',
        okText: 'Apply',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          applyJob({
            data: { job: jobId, job_seeker: jobseeker.id },
            fail: () => message.error('Apply failed!')
          });
        }
      });
    } else {
      confirm({
        title: 'You need to record your pitch video to apply.',
        okText: 'Record my pitch',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/record');
        }
      });
    }
  };

  removeJob = (e, jobId) => {
    e.stopPropagation();

    confirm({
      title: 'Are you sure you are not interested in this job?',
      okText: `I'm Sure`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJob(jobId);
      }
    });
  };

  filterJob = searchText => this.props.updateStatus({ searchText });

  renderJob = job => {
    const logo = helper.getJobLogo(job);
    const businessName = helper.getFullBWName(job);
    const contract = helper.getItemByID(DATA.contracts, job.contract).short_name;
    const hours = helper.getItemByID(DATA.hours, job.hours).short_name;
    const distance = helper.getDistanceFromLatLonEx(job.location_data, this.props.profile);
    return (
      <List.Item
        key={job.id}
        actions={[
          <span onClick={e => this.applyJob(e, job.id)}>Apply</span>,
          <span onClick={e => this.removeJob(e, job.id)}>Remove</span>
        ]}
        onClick={() => this.selectJob(job.id)}
      >
        <List.Item.Meta
          avatar={<img src={logo} alt="" width="100" />}
          title={`${job.title} (${businessName})`}
          description={
            <div>
              <div className="properties">
                <span>
                  {contract} / {hours}
                </span>
                <span>{distance}</span>
              </div>
              <div>{job.description}</div>
            </div>
          }
        />
      </List.Item>
    );
  };

  renderJobs = () => {
    const { jobs, searchText, currentPage, updateStatus, loading, loadingItem } = this.props;

    if (jobs.length === 0) {
      if (loading) {
        return <Loading size="large" />;
      }

      return (
        <AlertMsg>
          <span>
            {`There are no more jobs that match your profile.
              You can restore your removed matches by clicking refresh.`}
          </span>
          <a onClick={this.props.getJobs}>
            <Icons.Refresh />
            Refresh
          </a>
        </AlertMsg>
      );
    }

    const filteredJobs = jobs.filter(
      ({ title, location_data }) =>
        !searchText ||
        title.toLowerCase().indexOf(searchText) >= 0 ||
        location_data.name.toLowerCase().indexOf(searchText) >= 0 ||
        location_data.business_data.name.toLowerCase().indexOf(searchText) >= 0
    );

    if (filteredJobs.length === 0) {
      return (
        <AlertMsg>
          <span>No search results</span>
        </AlertMsg>
      );
    }

    const pageSize = 10;
    const index = (currentPage - 1) * pageSize;
    const pageJobs = filteredJobs.slice(index, index + pageSize);
    const pagination = {
      pageSize,
      current: currentPage,
      total: filteredJobs.length,
      onChange: currentPage => updateStatus({ currentPage })
    };

    return (
      <List
        itemLayout="horizontal"
        pagination={pagination}
        dataSource={pageJobs}
        loading={loading}
        renderItem={job => (job.id === loadingItem ? <Spin>{this.renderJob(job)}</Spin> : this.renderJob(job))}
      />
    );
  };

  render() {
    const { error, searchText, jobseeker } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Find Me Jobs" {...this.props} />;
    }

    return (
      <Container>
        <Helmet title="Find Me Jobs" />

        <PageHeader>
          <h2>Find Me Jobs</h2>
          <SearchBox width="200px" defaultValue={searchText} onChange={this.filterJob} />
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : (
          this.renderJobs()
        )}
      </Container>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    profile: state.auth.profile,
    jobs: state.js_find.jobs,
    error: state.js_find.error,
    currentPage: state.js_find.currentPage,
    searchText: state.js_find.searchText,
    loading: state.js_find.loading,
    loadingItem: state.js_find.loadingItem,
    requestRefresh: state.js_find.requestRefresh
  }),
  {
    updateStatus,
    getJobs,
    applyJob,
    removeJob
  }
)(FindJob);
