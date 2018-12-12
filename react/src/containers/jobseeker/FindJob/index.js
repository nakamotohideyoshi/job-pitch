import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Modal, Tooltip, Breadcrumb, Button, Drawer, message } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { findJobsAction, applyJobAction, removeJobAction, uploadSpecPitchAction } from 'redux/jobseeker/find';
import {
  PageHeader,
  PageSubHeader,
  SearchBox,
  AlertMsg,
  ListEx,
  Icons,
  Loading,
  Logo,
  PitchSelector,
  PopupProgress,
  JobDetails,
  LinkButton,
  VideoPlayerModal
} from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class FindJob extends React.Component {
  state = {
    selectedId: null,
    searchText: '',
    visibleDetail: false,
    pitchData: null,
    visibleApply: false,
    loading: null,
    playUrl: null
  };

  componentWillMount() {
    const { findJobsAction, location, jobs } = this.props;
    const { jobId } = location.state || {};
    if (jobId && jobs) {
      this.onSelect(jobId);
    } else {
      findJobsAction();
    }
  }

  componentWillReceiveProps() {
    const { selectedId } = this.state;
    if (selectedId) {
      const { jobs } = this.props;
      const selectedJob = jobs && helper.getItemById(jobs, selectedId);
      !selectedJob && this.onSelect();
    }
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onApply = (job, event) => {
    event && event.stopPropagation();

    const { jobseeker } = this.props;

    if (!jobseeker.active) {
      confirm({
        title: 'To apply please activate your account',
        okText: 'Activate',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          this.goProfile();
        }
      });
      return;
    }

    const pitch = helper.getPitch(jobseeker);

    if (!jobseeker.profile_image && !pitch) {
      confirm({
        title: 'To apply please set your photo',
        okText: 'Edit profile',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          this.goProfile();
        }
      });
      return;
    }

    if (job.requires_cv && !jobseeker.cv) {
      confirm({
        title:
          'Looks like this job wants you to upload a full CV before applying! You can upload a PDF or document to your profile.',
        okText: 'Edit Profile',
        cancelText: 'Cancel',
        maskClosable: true,
        onOk: () => {
          this.goProfile();
        }
      });
      return;
    }

    this.setState({ visibleApply: true, selectedId: job.id });
  };

  goProfile = () => {
    this.props.history.push('/jobseeker/settings/profile', {
      from: {
        pathname: '/jobseeker/find',
        state: {
          jobId: this.state.selectedId
        }
      }
    });
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
        this.onSelect();
        this.props.removeJobAction({
          id
        });
      }
    });
  };

  apply = () => {
    const createApplication = pitch => {
      this.setState({
        loading: {
          label: 'Saving...'
        }
      });

      this.props.applyJobAction({
        data: {
          job: this.state.selectedId,
          job_seeker: this.props.jobseeker.id,
          pitch
        },
        onSuccess: () => {
          this.setState({ loading: null, visibleApply: false, visibleDetail: false });
          message.success('The job is applied');
        },
        onFail: () => {
          this.setState({ loading: null });
          message.error('There was an error applying the job');
        }
      });
    };

    if (this.state.pitchData) {
      this.props.uploadSpecPitchAction({
        job_seeker: this.props.jobseeker.id,
        data: this.state.pitchData,
        onSuccess: pitch => createApplication(pitch.id),
        onFail: () => {
          this.setState({ loading: null });
          message.error('There was an error uploading the pitch');
        },
        onProgress: (label, progress) => {
          this.setState({
            loading: { label, progress }
          });
        }
      });
    } else {
      createApplication();
    }
  };

  videoPlay = playUrl => {
    this.setState({ playUrl });
  };

  changePitch = pitchData => {
    this.setState({ pitchData });
  };

  filterOption = job => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getJobSubName(job);
    return job.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderJob = job => {
    const { id, title, contract, hours, location_data, loading } = job;
    const logo = helper.getJobLogo(job);
    const name = helper.getJobSubName(job);
    const contractName = helper.getItemById(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemById(DATA.hours, hours).short_name;
    const sector = helper.getNameByID(DATA.sectors, job.sector);
    job.distance = helper.getDistanceFromLatLonEx(location_data, this.props.jobprofile);

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
        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {`There are no more jobs that match your profile.
          You can restore your removed matches by clicking refresh.`}
      </span>
      <LinkButton onClick={() => this.props.findJobsAction()}>
        <Icons.SyncAlt />
        Refresh
      </LinkButton>
    </AlertMsg>
  );

  render() {
    const { jobs, jobseeker, error } = this.props;
    const { visibleDetail, visibleApply, selectedId, pitchData, playUrl, loading } = this.state;

    const selectedJob = jobs && helper.getItemById(jobs, selectedId);
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
          <Link to="/jobseeker/settings/jobprofile">Change job criteria</Link>
        </PageSubHeader>

        <div className="content">
          <ListEx
            data={jobs}
            filterOption={this.filterOption}
            error={error && 'Server Error!'}
            renderItem={this.renderJob}
            emptyRender={this.renderEmpty}
          />
        </div>

        <Drawer placement="right" onClose={() => this.onSelect()} visible={visibleDetail}>
          {visibleDetail && selectedJob && (
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

        {visibleApply && selectedJob && (
          <Modal
            title="Apply for Job"
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
                Apply now!
              </Button>
            ]}
            bodyStyle={{ paddingTop: '12px' }}
          >
            {pitch && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Job Specific Pitch (optional)</h4>
                <p>
                  You can apply now with your{' '}
                  <LinkButton onClick={() => this.videoPlay(pitch.video)}>existing standard pitch</LinkButton> or you
                  can really impress by creating a video pitch for this specific job!
                </p>
              </div>
            )}

            <h4>Specific Pitch</h4>
            <PitchSelector onChange={this.changePitch} />
          </Modal>
        )}

        {playUrl && (
          <VideoPlayerModal
            autoplay
            controls
            sources={[
              {
                src: playUrl,
                type: 'video/mp4'
              }
            ]}
            onClose={() => this.videoPlay()}
          />
        )}

        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    jobprofile: state.auth.jobprofile,
    jobs: state.js_find.jobs,
    error: state.js_find.error
  }),
  {
    findJobsAction,
    applyJobAction,
    removeJobAction,
    uploadSpecPitchAction
  }
)(FindJob);
