import React from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';

import { uploadPitch } from 'redux/pitch';
import * as helper from 'utils/helper';

import { VideoRecorder, PopupProgress, Icons } from 'components';
import { Wrapper, HelpContent, VideoContent, ButtonContent } from './styled';

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

  changePitch = (property, pitchData) => {
    this.setState({ property, pitchData });
  };

  recordButton = props => (
    <Button type="primary" {...props}>
      Record New Pitch
    </Button>
  );

  render() {
    const { pitchUrl, pitchData, progress } = this.state;

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
          <VideoRecorder buttonComponent={this.recordButton} onChange={this.changePitch} />

          {pitchData && (
            <Button type="secondary" onClick={this.uploadPitch}>
              <Icons.Upload /> Upload
            </Button>
          )}
        </ButtonContent>

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
