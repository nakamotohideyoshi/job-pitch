import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Container, Button } from 'reactstrap';

import { Board, Loading, PopupProgress, VideoRecorder } from 'components';
import { loadProfile, uploadPitch } from 'redux/jobseeker/profile';
import Wrapper from './Wrapper';

class PitchRecord extends Component {
  componentWillMount() {
    this.props.loadProfile();
  }

  componentWillReceiveProps(nextProps) {
    const { jobseeker } = nextProps;
    if (jobseeker && jobseeker !== this.props.jobseeker) {
      const pitch = jobseeker.pitches ? jobseeker.pitches[0] : null;
      this.setState({
        pitchUrl: null,
        pitchData: pitch ? pitch.video : null
      });
    }
  }

  recordPitch = () => this.setState({ showRecorder: true });

  hideDialog = (url, data) => {
    this.setState({
      pitchUrl: url || this.state.pitchUrl,
      pitchData: data || this.state.pitchData,
      showRecorder: false
    });
  };

  uploadFile = () => {
    this.props.uploadPitch(this.props.jobseeker.id, this.state.pitchData, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
  };

  render() {
    if (!this.props.jobseeker) {
      return (
        <Wrapper>
          <Loading />
        </Wrapper>
      );
    }

    const { saving } = this.props;
    const { pitchUrl, pitchData, showRecorder, progress } = this.state;

    return (
      <Wrapper>
        <Helmet title="Record Pitch" />

        <Container>
          <h2>Record Pitch</h2>

          <Board block>
            <div className="help">
              {`Here you can record your 30 second pitch. The 30 sec.
                video will be viewed by prospective employers.`}
            </div>

            <div className="videoContainer">
              {pitchUrl ? (
                <video preload="auto" controls src={pitchUrl}>
                  <track kind="captions" />
                </video>
              ) : (
                <div />
              )}
            </div>

            <div className="buttons">
              <Button color="green" disabled={saving} onClick={this.recordPitch}>
                Record New Pitch
              </Button>

              {pitchData && (
                <Button color="yellow" disabled={saving} onClick={this.uploadFile}>
                  <i className="fa fa-upload" />
                  {!saving ? 'Upload' : 'Uploading...'}
                </Button>
              )}
            </div>
          </Board>
        </Container>

        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}

        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    errors: state.js_profile.errors,
    saving: state.js_profile.saving
  }),
  { loadProfile, uploadPitch }
)(PitchRecord);
