import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Modal, Tooltip, Breadcrumb, Button, Drawer, notification } from 'antd';

import { findJobs, applyJob, removeJob } from 'redux/jobseeker/find';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, PageSubHeader, SearchBox, AlertMsg, ListEx, Icons, Loading, JobDetails, Logo } from 'components';
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

    if (helper.loadData('apply')) {
      helper.saveData('apply');
      notification.success({
        message: 'Application submitted successfully.'
      });
    }
  }

  componentWillReceiveProps() {
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

    const { jobseeker, history, applyJob } = this.props;

    if (!jobseeker.active) {
      confirm({
        content: 'To apply please activate your account',
        okText: 'Activate',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/profile');
        }
      });
      return;
    }

    confirm({
      content: 'Yes, I want to apply to this job',
      okText: 'Apply',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        applyJob({
          data: {
            job: id,
            job_seeker: jobseeker.id
          },
          onSuccess: () => {
            notification.success({
              message: 'Success',
              description: 'The job is applied'
            });
          },
          onFail: () => {
            notification.error({
              message: 'Error',
              description: 'There was an error'
            });
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
    const { id, title, contract, hours, location_data, loading } = job;
    const logo = helper.getJobLogo(job);
    const name = helper.getFullBWName(job);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const sector = helper.getNameByID('sectors', job.sector);
    job.distance = helper.getDistanceFromLatLonEx(location_data, this.props.profile);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title={'Apply for job'}>
            <span onClick={e => this.onApply(job, e)}>
              <Icons.Link />
            </span>
          </Tooltip>,
          <Tooltip placement="bottom" title="Not interested">
            <span onClick={e => this.onRemove(job, e)}>
              <Icons.Times />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" padding="10px" />}
          title={`${title} (${name})`}
          description={`${sector} (${contractName} / ${hoursName})`}
        />
        <span style={{ width: '60px' }}>{job.distance}</span>
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

        <PageSubHeader>
          <Breadcrumb />
          <Link to="/jobseeker/settings/jobprofile">Change job matches</Link>
        </PageSubHeader>

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

        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedJob}>
          {selectedJob && (
            <JobDetails
              jobData={selectedJob}
              roughLocation
              actions={
                <div>
                  <Button type="primary" disabled={selectedJob.loading} onClick={() => this.onApply(selectedJob)}>
                    Apply for job
                  </Button>
                  <Button type="danger" disabled={selectedJob.loading} onClick={() => this.onRemove(selectedJob)}>
                    Not interested
                  </Button>
                </div>
              }
            />
          )}
        </Drawer>
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
