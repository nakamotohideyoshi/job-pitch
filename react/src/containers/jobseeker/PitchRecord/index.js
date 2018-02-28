import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faUpload from '@fortawesome/fontawesome-free-solid/faUpload';

import { Board, Loading, PopupProgress, VideoRecorder } from 'components';
import { confirm } from 'redux/common';
import { loadProfile, uploadPitch } from 'redux/jobseeker/profile';
import Container from './Wrapper';

import itunesImage from 'assets/itunes-button.svg';

class PitchRecord extends React.Component {
  state = {};

  componentWillMount() {
    this.props.loadProfile();
  }

  componentWillReceiveProps(nextProps) {
    const { jobseeker } = nextProps;
    if (jobseeker && jobseeker !== this.props.jobseeker) {
      const { pitches } = jobseeker;
      const pitch = (pitches || {}).length > 0 ? pitches[pitches.length - 1] : null;
      this.setState({
        pitchUrl: pitch ? pitch.video : null,
        pitchData: null
      });
    }
  }

  recordPitch = () => {
    if (navigator.userAgent.indexOf('iPhone') !== -1) {
      this.props.confirm('Confirm', `To record your video, you need to download the app`, [
        { outline: true },
        {
          component: (
            <img
              src={itunesImage}
              onClick={() => {
                window.open('https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&mt=8', '_blank');
              }}
              alt=""
              height="33"
            />
          )
        }
      ]);
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

  uploadFile = () => {
    this.props.uploadPitch(this.props.jobseeker.id, this.state.pitchData, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
  };

  render() {
    if (!this.props.jobseeker) {
      return (
        <Container>
          <Loading />
        </Container>
      );
    }

    const { saving } = this.props;
    const { pitchUrl, pitchData, showRecorder, progress } = this.state;

    return (
      <Fragment>
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
                  <FontAwesomeIcon icon={faUpload} />
                  {!saving ? 'Upload' : 'Uploading...'}
                </Button>
              )}
            </div>
          </Board>
        </Container>

        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}

        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    errors: state.js_profile.errors,
    saving: state.js_profile.saving
  }),
  { loadProfile, uploadPitch, confirm }
)(PitchRecord);
