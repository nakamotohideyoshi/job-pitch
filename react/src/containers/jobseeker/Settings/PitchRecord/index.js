import React from 'react';
import { connect } from 'react-redux';
import { Button, message, Modal } from 'antd';

import { uploadPitch } from 'redux/jobseeker/profile';
import * as helper from 'utils/helper';

import { PopupProgress, Icons, VideoRecorder } from 'components';
import { Wrapper, HelpContent, VideoContent, ButtonContent } from './styled';

const { confirm } = Modal;

class PitchRecord extends React.Component {
  state = {
    showRecorder: false,
    pitchUrl: null,
    pitchData: null,
    loading: null
  };

  componentWillMount() {
    const pitch = helper.getPitch(this.props.jobseeker) || {};
    this.setState({
      pitchUrl: pitch.video,
      pitchData: null
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
    const pitchUrl = url || this.state.pitchUrl;
    const pitchData = data || this.state.pitchData;
    this.setState({ pitchUrl, pitchData, showRecorder: false });
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

  render() {
    const { pitchUrl, pitchData, loading, showRecorder } = this.state;

    return (
      <Wrapper>
        <HelpContent>
          Record your up to 30 sec selfie video. The key is to just be yourself! You can record on your phone pretty
          much anywhere, at home on the bus or in a coffee shop it doesn’t matter, and you can re-record as many times
          as you want.<br />
          Check out our{' '}
          <a href="https://vimeo.com/255467562" target="_blank" rel="noopener noreferrer">
            example video
          </a>
          !
        </HelpContent>

        <VideoContent>
          <video preload="auto" controls={!!pitchUrl} src={pitchUrl}>
            <track kind="captions" />
          </video>
          {!pitchUrl && <span> No Pitch </span>}
        </VideoContent>

        <ButtonContent>
          <Button type="primary" onClick={this.openRecorder}>
            Record New Pitch
          </Button>
          {pitchData && (
            <Button type="secondary" onClick={this.uploadPitch}>
              <Icons.Upload /> Upload
            </Button>
          )}
        </ButtonContent>

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
