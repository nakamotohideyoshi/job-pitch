import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, message } from 'antd';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';

import { VideoRecorder, PopupProgress } from 'components';
import { Wrapper, HelpContent, VideoContent, ButtonContent } from './Wrapper';

import * as helper from 'utils/helper';
import { uploadPitch } from 'redux/jobseeker/pitch';

const confirm = Modal.confirm;

class PitchRecord extends React.Component {
  state = {
    loading: false
  };

  componentWillMount() {
    const pitch = helper.getPitch(this.props.jobseeker) || {};
    this.setState({
      pitchUrl: pitch.video,
      pitchData: null
    });
  }

  uploadPitch = () => {
    this.props.uploadPitch({
      data: this.state.pitchData,
      onUploadProgress: (label, value) => {
        const progress = label ? { label, value } : null;
        this.setState({ progress });
      },
      success: () => {
        this.setState({ progress: null });
        message.success('Pitch uploaded successfully!');
      },
      fail: error => {
        this.setState({ progress: null });
        message.error(error);
      }
    });
  };

  recordPitch = () => {
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

  hideDialog = (url, data) => {
    this.setState({
      pitchUrl: url || this.state.pitchUrl,
      pitchData: data || this.state.pitchData,
      showRecorder: false
    });
  };

  render() {
    const { pitchUrl, pitchData, showRecorder, progress } = this.state;

    return (
      <Wrapper>
        <HelpContent>
          {`Here you can record your 30 second pitch. The 30 sec.
                video will be viewed by prospective employers.`}
        </HelpContent>

        <VideoContent>
          <video preload="auto" controls={!!pitchUrl} src={pitchUrl}>
            <track kind="captions" />
          </video>
          {!pitchUrl && <span> No Pitch </span>}
        </VideoContent>

        <ButtonContent>
          <Button type="primary" onClick={this.recordPitch}>
            Record New Pitch
          </Button>

          {pitchData && (
            <Button type="secondary" onClick={this.uploadPitch}>
              <FontAwesomeIcon icon={faUpload} /> Upload
            </Button>
          )}
        </ButtonContent>

        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}

        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker
  }),
  { uploadPitch }
)(PitchRecord);
