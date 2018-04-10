import React from 'react';
import { connect } from 'react-redux';
import { Button, message } from 'antd';

import { uploadPitch } from 'redux/jobseeker/pitch';
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
