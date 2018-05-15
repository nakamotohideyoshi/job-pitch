import React, { Fragment } from 'react';

import ReadyLabel from './ReadyLabel';
import RecLabel from './RecLabel';
import { Wrapper, VideoContainer, RecButton, TimeBar, ErrorLabel } from './Recorder.styled';

const NONE = 'NONE';
const READY = 'READY';
const RECORDING = 'RECORDING';

export default class RecordModal extends React.Component {
  state = {
    status: NONE
  };

  componentWillMount() {
    this.setupVideo();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }

    if (this.state.stream) {
      const tracks = this.state.stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
    }
  }

  setupVideo = () => {
    if (typeof MediaRecorder === 'undefined') {
      this.setState({
        error: 'Your browser does not supports Media Recorder API.'
      });
      return;
    }

    if ((navigator.mediaDevices || {}).getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = constraints => {
        const getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('Your browser does not supports Media Recorder API.'));
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
      stream => {
        this.video.srcObject = stream;
        this.setState({ stream });
      },
      error => this.setState({ error: error.name })
    );
  };

  onClickButton = () => {
    switch (this.state.status) {
      case NONE:
        this.readyRecording();
        break;
      case READY:
        this.cancelRecording();
        break;
      case RECORDING:
        this.stopRecording();
        break;
      default:
        break;
    }
  };

  readyRecording = () => {
    this.setState({
      status: READY,
      time: 10000
    });

    this.timer = setInterval(() => {
      const { time } = this.state;
      if (time > 0) {
        this.setState({ time: time - 1000 });
      } else {
        this.startRecording();
      }
    }, 1000);
  };

  startRecording = () => {
    clearInterval(this.timer);

    this.recordedBlobs = [];
    let options = { mimeType: 'video/webm;codecs=vp9' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm;codecs=vp8' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: '' };
        }
      }
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.state.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder: ' + e);
      return;
    }

    this.mediaRecorder.start(10); // collect 10ms of data
    this.mediaRecorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    };

    this.startTime = new Date().getTime();
    this.setState({
      status: RECORDING,
      time: 0
    });

    this.timer = setInterval(() => {
      const time = new Date().getTime() - this.startTime;
      if (time < 30000) {
        this.setState({ time });
      } else {
        this.stopRecording();
      }
    }, 100);
  };

  stopRecording = () => {
    this.cancelRecording();

    this.mediaRecorder.stop();
    this.mediaRecorder = null;

    const superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(superBuffer);
    this.props.onClose(url, superBuffer);
  };

  cancelRecording = () => {
    this.setState({ status: NONE });
    clearInterval(this.timer);
  };

  render() {
    const { status, stream, error, time } = this.state;

    return (
      <Wrapper title="Video Recorder" visible maskClosable={false} footer={null} onCancel={() => this.props.onClose()}>
        <VideoContainer>
          <video
            preload="auto"
            autoPlay
            ref={ref => {
              this.video = ref;
            }}
            muted
          >
            <track kind="captions" />
          </video>

          {stream && (
            <RecButton onClick={this.onClickButton}>
              <span style={{ borderRadius: status === NONE ? '50%' : '18%' }} />
            </RecButton>
          )}

          {status === READY && <ReadyLabel time={Math.floor(time / 1000)} />}

          {status === RECORDING && (
            <Fragment>
              <RecLabel time={Math.floor(time / 1000)} />
              <TimeBar>
                <div />
                <div style={{ width: `${100 - time / 300}%` }} />
              </TimeBar>
            </Fragment>
          )}

          {error && <ErrorLabel>{error}</ErrorLabel>}
        </VideoContainer>
      </Wrapper>
    );
  }
}
