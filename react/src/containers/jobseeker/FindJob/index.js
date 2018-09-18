import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Modal, Tooltip, Breadcrumb, Button, Drawer, notification } from 'antd';

import { findJobs, applyJob, removeJob, uploadSpecPitch } from 'redux/jobseeker/find';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import {
  PageHeader,
  PageSubHeader,
  SearchBox,
  AlertMsg,
  ListEx,
  Icons,
  Loading,
  JobDetails,
  Logo,
  PitchSelector,
  PopupProgress
} from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

class FindJob extends React.Component {
  state = {
    selectedId: null,
    searchText: '',
    visibleDetail: false,
    pitchData: null,
    visibleApply: false,
    loading: null
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

  onApply = ({ id }, event) => {
    event && event.stopPropagation();

    const { jobseeker, jobs, history } = this.props;

    if (!jobseeker.active) {
      confirm({
        title: 'To apply please activate your account',
        okText: 'Activate',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/profile');
        }
      });
      return;
    }

    if (!jobseeker.profile_image) {
      confirm({
        title: 'To apply please set your photo',
        okText: 'Edit profile',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/profile');
        }
      });
      return;
    }

    const selectedJob = jobs && helper.getItemByID(jobs, this.state.selectedId);

    if (selectedJob.requires_cv && !jobseeker.cv) {
      confirm({
        title: 'This job requires your cv',
        okText: 'Edit Profile',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          history.push('/jobseeker/settings/profile');
        }
      });
      return;
    }

    this.setState({ visibleApply: true, selectedId: id });
  };

  onSelect = selectedId => this.setState({ visibleDetail: !!selectedId, selectedId });

  hideApplyDialog = () => this.setState({ visibleApply: false });

  onRemove = ({ id }, event) => {
    event && event.stopPropagation();

    confirm({
      title: 'Are you sure you are not interested in this job?',
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

  apply = () => {
    this.setState({
      loading: {
        label: 'Saving...'
      }
    });

    this.props.applyJob({
      data: {
        job: this.state.selectedId,
        job_seeker: this.props.jobseeker.id
      },
      onSuccess: application => {
        if (this.state.pitchData) {
          this.uploadPitch(application);
        } else {
          this.setState({ loading: null });
          notification.success({
            message: 'Success',
            description: 'The job is applied'
          });
        }
      },
      onFail: () => {
        this.setState({ loading: null });
        notification.error({
          message: 'Error',
          description: 'There was an error'
        });
      }
    });
  };

  uploadPitch = ({ id }) => {
    this.props.uploadSpecPitch({
      job_seeker: this.props.jobseeker.id,
      application: id,
      data: this.state.pitchData,
      onSuccess: msg => {
        this.setState({ loading: null });
        notification.success({
          message: 'Success',
          description: 'The job is applied'
        });
      },
      onFail: error => {
        this.setState({ loading: null });
        notification.error({
          message: 'Error',
          description: 'There was an error'
        });
      },
      onProgress: (label, progress) => {
        this.setState({
          loading: { label, progress }
        });
      }
    });
  };

  changePitch = pitchData => {
    this.setState({ pitchData });
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
        <Icons.SyncAlt />
        Refresh
      </a>
    </AlertMsg>
  );

  render() {
    const { jobs, jobseeker, error } = this.props;
    const { visibleDetail, visibleApply, selectedId, pitchData, loading } = this.state;

    const selectedJob = jobs && helper.getItemByID(jobs, selectedId);
    const pitch = helper.getPitch(jobseeker);

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

        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={visibleDetail}>
          {visibleDetail && (
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

        {visibleApply && (
          <Modal
            title="Specific Pitch"
            visible
            onOk={this.apply}
            onCancel={this.hideApplyDialog}
            okText="Apply"
            footer={[
              <Button key="cancel" onClick={this.hideApplyDialog}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={selectedJob.requires_pitch && !pitch && !pitchData}
                onClick={this.apply}
              >
                Apply
              </Button>
            ]}
          >
            <PitchSelector onChange={this.changePitch} />

            {!pitch && (
              <div style={{ marginTop: '20px' }}>
                or <Link to="/jobseeker/settings/record">Record Pitch</Link> on profile
              </div>
            )}
          </Modal>
        )}

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
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
    removeJob,
    uploadSpecPitch
  }
)(FindJob);
