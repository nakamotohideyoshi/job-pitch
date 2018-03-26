import React from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { message, Modal, Button, Icon } from 'antd';

import { Loading, PageHeader, AlertMsg, JobDetail, VideoRecorder, VideoPlayer, PopupProgress, Icons } from 'components';
import Container from './Wrapper';
import NoPitch from '../NoPitch';

import * as helper from 'utils/helper';
import { getJobs, applyJob, removeJob } from 'redux/jobseeker/find';
import { uploadJobPitch } from 'redux/jobseeker/pitch';

const { confirm } = Modal;

class JSJobDetail extends React.Component {
  state = {
    job: null,
    showRecorder: false,
    videoUrl: null,
    newPitchUrl: null,
    progress: null
  };

  componentWillMount() {
    if (this.props.jobs.length) {
      this.getJob();
    } else {
      this.props.getJobs({
        success: this.getJob
      });
    }
  }

  getJob = () => {
    const { jobs, match, profile } = this.props;
    const jobId = helper.str2int(match.params.jobId);
    const job = helper.getItemByID(jobs, jobId);
    if (job) {
      job.distance = helper.getDistanceFromLatLonEx(job.location_data, profile);
      this.setState({ job });
    } else {
      this.goFind();
    }
  };

  goFind = () => this.props.history.push('/jobseeker/find');

  recordPitch = () => {
    if (this.props.loadingItem === this.state.job.id) return;

    if (navigator.userAgent.indexOf('iPhone') !== -1) {
      confirm({
        title: 'To record your video, you need to download the app',
        okText: 'Sign out',
        maskClosable: true,
        onOk: () => {
          window.open('https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&mt=8', '_blank');
        }
      });
    } else {
      this.setState({ showRecorder: true });
    }
  };

  cancelNewPitch = () =>
    this.setState({
      newPitchUrl: null,
      newPitchData: null
    });

  playVideo = videoUrl => this.setState({ videoUrl });

  hideDialog = (url, data) => {
    this.setState({
      newPitchUrl: url || this.state.newPitchUrl,
      newPitchData: data || this.state.newPitchData,
      showRecorder: false,
      videoUrl: null
    });
  };

  applyJob = () => {
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
            data: { job: this.state.job.id, job_seeker: jobseeker.id },
            success: () => {
              // if (this.state.newPitchData) {
              //   this.uploadJobPitch();
              // } else {
              this.goFind();
              // }
            },
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

  uploadJobPitch = () => {
    this.props.uploadJobPitch({
      data: this.state.newPitchData,
      onUploadProgress: (label, value) => {
        const progress = label ? { label, value } : null;
        this.setState({ progress });
      },
      success: () => {
        this.setState({ progress: null });
        message.success('Profile saved successfully!');

        if (!this.props.jobseeker.profile) {
          this.props.history.push('/jobseeker/settings/jobprofile');
        }
      },
      fail: error => {
        this.setState({ progress: null });
        message.error(error);
      }
    });
  };

  removeJob = () => {
    const { removeJob, loadingItem } = this.props;
    const { job } = this.state;

    if (loadingItem === job.id) return;

    confirm({
      title: 'Are you sure you are not interested in this job?',
      okText: `I'm Sure`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        removeJob(job.id);
        this.goFind();
      }
    });
  };

  render() {
    const { error, jobseeker, loadingItem } = this.props;
    const { job, showRecorder, videoUrl, newPitchUrl, progress } = this.state;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="Find Me Jobs" {...this.props} />;
    }

    return (
      <Container>
        <Helmet title="Find Me Jobs" />

        <PageHeader>
          <h2>Job Detail</h2>
          <Link to="/jobseeker/find">{'<< Back Job List'}</Link>
        </PageHeader>

        {error ? (
          <AlertMsg>
            <span>Server Error!</span>
          </AlertMsg>
        ) : !job ? (
          <Loading size="large" />
        ) : (
          <div className="content">
            <JobDetail className="job-detail" job={job} />

            <div className="buttons">
              <Button onClick={this.recordPitch}>
                <Icons.Video />
                Record Pitch
              </Button>

              {newPitchUrl ? (
                <div className="record-info">
                  <span onClick={() => this.playVideo(newPitchUrl)}>
                    <Icon type="paper-clip" />Pitch Video
                  </span>
                  <Icon type="close" onClick={this.cancelNewPitch} />
                </div>
              ) : (
                <div />
              )}

              <Button type="primary" loading={loadingItem === job.id} onClick={this.applyJob}>
                Apply
              </Button>

              <Button onClick={this.removeJob}>Remove</Button>
            </div>
          </div>
        )}

        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}
        {videoUrl && <VideoPlayer videoUrl={videoUrl} onClose={this.hideDialog} />}
        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Container>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    profile: state.auth.profile,
    jobs: state.js_find.jobs,
    error: state.js_myapps.error,
    loadingItem: state.js_find.loadingItem
  }),
  {
    getJobs,
    applyJob,
    removeJob,
    uploadJobPitch
  }
)(JSJobDetail);
