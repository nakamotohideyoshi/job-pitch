import React from 'react';
import { connect } from 'react-redux';
import { Button, message, Modal, Upload } from 'antd';

import * as helper from 'utils/helper';
import { uploadPitchAction } from 'redux/jobseeker/profile';
import { PopupProgress, Icons, VideoRecorder, VideoPlayer } from 'components';
import Wrapper from './PitchRecord.styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class PitchRecord extends React.Component {
  state = {
    showRecorder: false,
    pitchUrl: null,
    pitchData: null,
    loading: null
  };

  componentWillMount() {
    this.updatePitch();
  }

  updatePitch() {
    const pitch = helper.getPitch(this.props.jobseeker) || {};
    this.setState({
      loading: null,
      pitchUrl: pitch.video,
      pitchData: null,
      poster: pitch.thumbnail
    });
  }

  openRecorder = () => {
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

  closeRecorder = (url, data) => {
    const pitchUrl = url || this.state.pitchUrl;
    const pitchData = data || this.state.pitchData;
    this.setState({ pitchUrl, pitchData, showRecorder: false });
  };

  setPitchFile = ({ file }) => {
    if (file.type !== 'video/mp4' && file.type !== 'video/avi' && file.type !== 'video/quicktime') {
      message.error('You can only upload mp4, avi, mov file!');
      return;
    }

    if (file.size > 10000000) {
      message.error('You can only upload file less than 10MB!');
      return;
    }

    helper.getBase64(file, url => {
      this.closeRecorder(url, file);
    });
  };

  uploadPitch = () => {
    this.props.uploadPitchAction({
      data: this.state.pitchData,
      onSuccess: () => {
        this.updatePitch();
        message.success('Pitch is uploaded successfully.');

        const { from } = this.props.location.state || {};
        if (from) {
          this.props.history.push(from);
        }
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
    const { pitchUrl, pitchData, loading, showRecorder, poster } = this.state;

    return (
      <Wrapper>
        <div className="help-container">
          Record your up to 30 sec selfie video. The key is to just be yourself! You can record on your phone pretty
          much anywhere, at home on the bus or in a coffee shop it doesn’t matter, and you can re-record as many times
          as you want.
          <br />
          Check out our{' '}
          <a href="https://vimeo.com/255467562" target="_blank" rel="noopener noreferrer">
            example video
          </a>
          !
        </div>

        <div className="video-container">
          <VideoPlayer
            controls
            poster={!pitchData && poster}
            sources={[
              {
                src: pitchUrl,
                type: 'video/mp4'
              }
            ]}
          />

          {!pitchUrl && <span> Great show who you are here for your next Job </span>}
        </div>

        <div className="button-container">
          <Button type="secondary" onClick={this.openRecorder}>
            Record New Pitch
          </Button>

          <Upload showUploadList={false} beforeUpload={() => false} onChange={this.setPitchFile}>
            <Button>
              <Icons.Hdd /> Select File
            </Button>
          </Upload>

          {pitchData && (
            <Button type="primary" onClick={this.uploadPitch}>
              <Icons.CloudUpload /> Upload
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
    jobseeker: state.auth.jobseeker
  }),
  { uploadPitchAction }
)(PitchRecord);
