import React from 'react';
import { connect } from 'react-redux';
import { Button, message, Modal } from 'antd';

import { uploadPitch } from 'redux/jobseeker/profile';
import * as helper from 'utils/helper';

import { PopupProgress, Icons, VideoRecorder, VideoPlayer, VideoPlayerModal } from 'components';
import Wrapper from './PitchRecord.styled';

const { confirm } = Modal;

class PitchRecord extends React.Component {
  state = {
    showRecorder: false,
    pitchUrl: null,
    pitchData: null,
    loading: null,
    newPitchUrl: null,
    showNewPitch: false
  };

  componentWillMount() {
    const pitch = helper.getPitch(this.props.jobseeker) || {};
    this.setState({
      pitchUrl: pitch.video,
      pitchData: null,
      poster: pitch.thumbnail
    });
  }

  openRecorder = () => {
    if (navigator.userAgent.indexOf('iPhone') !== -1) {
      confirm({
        content: 'To record your video, you need to download the app',
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

  closeRecorder = (url, data) => {
    const pitchUrl = this.state.pitchUrl;
    const pitchData = data || this.state.pitchData;
    const newPitchUrl = url === undefined ? null : url;
    this.setState({ pitchUrl, pitchData, showRecorder: false, newPitchUrl });
  };

  uploadPitch = () => {
    this.props.uploadPitch({
      data: this.state.pitchData,
      onSuccess: () => {
        this.setState({ loading: null });
        message.success('Pitch is uploaded successfully.');
      },
      onFail: error => {
        this.setState({ loading: null });
        message.error('Uploading is failed.');
      },
      onProgress: (label, progress) => {
        this.setState({
          loading: { label, progress }
        });
      }
    });
  };

  showModal = () => {
    this.setState({ showNewPitch: true });
  };

  hideModal = () => {
    this.setState({ showNewPitch: false });
  };

  render() {
    const { pitchUrl, pitchData, loading, showRecorder, poster, newPitchUrl, showNewPitch } = this.state;

    return (
      <Wrapper>
        <div className="help-container">
          Record your up to 30 sec selfie video. The key is to just be yourself! You can record on your phone pretty
          much anywhere, at home on the bus or in a coffee shop it doesn’t matter, and you can re-record as many times
          as you want.<br />
          Check out our{' '}
          <a href="https://vimeo.com/255467562" target="_blank" rel="noopener noreferrer">
            example video
          </a>
          !
        </div>

        <div className="video-container">
          <VideoPlayer
            controls
            poster={poster}
            preload="none"
            sources={[
              {
                src: pitchUrl,
                type: 'video/mp4'
              }
            ]}
          />

          {!pitchUrl && <span> Great show who you are here for your next Job </span>}
        </div>

        {showNewPitch && (
          <VideoPlayerModal
            autoplay
            controls
            sources={[
              {
                src: newPitchUrl,
                type: 'video/mp4'
              }
            ]}
            onClose={() => this.hideModal()}
          />
        )}

        <div className="button-container">
          <Button type="primary" onClick={this.openRecorder}>
            Record New Pitch
          </Button>
          {newPitchUrl && (
            <Button type="secondary" onClick={this.showModal}>
              <Icons.PlayCircle /> New Pitch
            </Button>
          )}
          {pitchData && (
            <Button type="secondary" onClick={this.uploadPitch}>
              <Icons.Upload /> Upload
            </Button>
          )}
        </div>

        {showRecorder && <VideoRecorder onClose={this.closeRecorder} />}
        {loading && <PopupProgress label={loading.label} value={loading.progress} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker
  }),
  { uploadPitch }
)(PitchRecord);
