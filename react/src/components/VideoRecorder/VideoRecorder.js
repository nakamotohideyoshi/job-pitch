import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RecordRTC from 'recordrtc';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import styles from './VideoRecorder.scss';

const NONE = 'NONE';
const READY = 'READY';
const RECORDING = 'RECORDING';

export default class VideoRecorder extends Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { status: NONE };
  }

  componentDidMount() {
    this.setupVideo();
  }

  componentWillUnmount() {
    if (this.stream) {
      this.stream.stop();
    }

    if (this.videoRecorder) {
      this.videoRecorder.destroy();
    }

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onClose = () => {
    if (this.state.status === RECORDING) {
      this.videoRecorder.stopRecording();
    }
    this.props.onClose();
  }

  setupVideo = () => {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }

    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = constraints => {
        const getUserMedia = navigator.getUserMedia ||
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
        this.stream = stream;
        this.setState({
          videoUrl: window.URL.createObjectURL(stream)
        });
      },
      error => {
        this.setState({ error: error.name });
      }
    );
  }

  cancelRecording = () => {
    this.setState({ status: NONE });
    clearInterval(this.timer);
  }

  readyRecording = () => {
    this.setState({
      status: READY,
      time: __DEVELOPMENT__ ? 1 : 10,
    });

    this.timer = setInterval(
      () => {
        const { time } = this.state;
        if (time > 0) {
          this.setState({ time: time - 1 });
        } else {
          this.startRecording();
        }
      },
      1000
    );
  }

  startRecording = () => {
    this.videoRecorder = RecordRTC(this.stream, { type: 'video' });
    this.videoRecorder.startRecording();

    this.setState({
      status: RECORDING,
      time: 0,
    });

    clearInterval(this.timer);
    this.timer = setInterval(
      () => {
        const { time } = this.state;
        if (time < 30) {
          this.setState({ time: time + 1 });
        } else {
          this.stopRecording();
        }
      },
      1000
    );
  }

  stopRecording = () => {
    this.cancelRecording();

    this.videoRecorder.stopRecording(url =>
      this.videoRecorder.getDataURL(data => {
        this.props.onClose(url, data);
      })
    );
  }

  renderRecTime = () => {
    const { status, time } = this.state;

    if (status === READY) {
      return time;
    }

    return time < 10 ? `0 : 0${time}` : `0 : ${time}`;
  }

  renderButtons = () => {
    switch (this.state.status) {
      case NONE:
        return (
          <Button
            bsStyle="success"
            onClick={this.readyRecording}
          >Record</Button>
        );
      case READY:
        return (
          <Button
            bsStyle="warning"
            onClick={this.cancelRecording}
          >Ready</Button>
        );
      case RECORDING:
        return (
          <Button
            bsStyle="danger"
            onClick={() => this.stopRecording()}
          >Stop</Button>
        );
      default:
    }
  }

  render() {
    const { status, videoUrl, error } = this.state;

    return (
      <Modal show onHide={this.onClose} backdrop="static">

        <Modal.Header closeButton>
          <Modal.Title>Video Recorder</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className={styles.videoContainer}>
            <video
              preload="auto"
              autoPlay
              src={videoUrl}
            >
              <track kind="captions" />
            </video>
            {
              status !== NONE &&
              <div className={styles.recLabel}>
                { this.renderRecTime() }
              </div>
            }
          </div>

          <div className={styles.footerContainer}>
            {
              videoUrl &&
              this.renderButtons()
            }
            {
              error &&
              <div className={styles.error}>{ error }</div>
            }
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
