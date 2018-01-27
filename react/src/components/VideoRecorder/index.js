import React from 'react';
import RecordRTC from 'recordrtc';
import { ModalHeader, ModalBody } from 'reactstrap';

import { Alert } from 'components';
import RecLabel from './RecLabel';
import Wrapper from './Wrapper';

const NONE = 'NONE';
const READY = 'READY';
const RECORDING = 'RECORDING';

export default class VideoRecorder extends React.Component {
  state = {
    status: NONE
  };

  componentWillMount() {
    this.setupVideo();
  }

  componentWillUnmount() {
    if (this.state.stream) {
      this.state.stream.stop();
    }

    if (this.videoRecorder) {
      this.videoRecorder.destroy();
    }

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  setupVideo = () => {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = constraints => {
        const getUserMedia =
          navigator.getUserMedia ||
          navigator.webkitGetUserMedia ||
          navigator.mozGetUserMedia ||
          navigator.msGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constraints, resolve, reject);
        });
      };
    }

    navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
      stream => {
        this.video.srcObject = stream;
        if (typeof MediaRecorder === 'undefined') {
          this.setState({
            error: 'Your browser does not supports Media Recorder API.'
          });
        } else {
          this.setState({ stream });
        }
      },
      error => this.setState({ error: error.name })
    );
  };

  onClose = () => {
    if (this.state.status === RECORDING) {
      this.videoRecorder.stopRecording();
    }
    this.props.onClose();
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
      time: 1000 //10000
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
    this.videoRecorder = RecordRTC(this.state.stream, { type: 'video' });
    this.videoRecorder.startRecording();

    this.startTime = new Date().getTime();
    this.setState({
      status: RECORDING,
      time: 0
    });

    clearInterval(this.timer);
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

    this.videoRecorder.stopRecording(url => {
      this.props.onClose(url, this.videoRecorder.blob);
    });
  };

  cancelRecording = () => {
    this.setState({ status: NONE });
    clearInterval(this.timer);
  };

  render() {
    const { status, stream, error, time } = this.state;

    return (
      <Wrapper isOpen size="lg">
        <ModalHeader toggle={this.onClose}>Video Recorder</ModalHeader>
        <ModalBody>
          {error && <Alert type="danger">{error}</Alert>}
          <div className="videoContainer">
            <video
              preload="auto"
              autoPlay
              ref={ref => {
                this.video = ref;
              }}
            >
              <track kind="captions" />
            </video>

            {status !== NONE && <RecLabel isRec={status === RECORDING} time={Math.floor(time / 1000)} />}

            {stream && (
              <div className="rec-button" onClick={this.onClickButton}>
                <span style={{ borderRadius: status === NONE ? '50%' : '18%' }} />
              </div>
            )}

            {status === RECORDING && (
              <div className="bar">
                <div />
                <div style={{ width: `${100 - time / 300}%` }} />
              </div>
            )}
          </div>
        </ModalBody>
      </Wrapper>
    );
  }
}
