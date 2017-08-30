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
    videoUrl: PropTypes.string,
    onClose: PropTypes.func.isRequired,
  }

  static defaultProps = {
    videoUrl: null,
  }

  constructor(props) {
    super(props);

    this.state = {
      status: NONE,
    };
  }

  componentDidMount() {
    if (!this.props.videoUrl) {
      this.setupVideo();
    }
  }

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  onClose = () => {
    if (this.state.status === RECORDING) {
      this.stopRecording();
    }
    this.props.onClose();
  }

  setupVideo = () => {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia || navigator.msGetUserMedia;

    navigator.getUserMedia({
      audio: true,
      video: { frameRate: { ideal: 20, max: 30 } },
      height: '360px',
      width: '480px'
    },
    stream => {
      this.stream = stream;
      this.setState({
        cameraUrl: window.URL.createObjectURL(stream)
      });
    },
    err => {
      console.log(err.name);
    });
  }

  clearTimer = () => {
    clearInterval(this.timer);
    this.timer = null;
  }

  readyRecording = () => {
    this.setState({
      status: READY,
      time: __DEVELOPMENT__ ? 1 : 10,
    });

    this.timer = setInterval(() => {
      const { time } = this.state;
      if (time > 0) {
        this.setState({ time: time - 1 });
      } else {
        this.clearTimer();
        this.startRecording();
      }
    }, 1000);
  }

  cancelRecording = () => {
    this.clearTimer();
    this.setState({ status: NONE });
  }

  startRecording = () => {
    this.videoRecorder = RecordRTC(
      this.stream,
      {
        type: 'video',
        video: {
          width: 640,
          height: 480
        },
        canvas: {
          width: 640,
          height: 480
        }
      }
    );
    this.videoRecorder.startRecording();

    this.setState({
      status: RECORDING,
      time: 0,
    });

    this.timer = setInterval(() => {
      const { time } = this.state;
      if (time < 30) {
        this.setState({ time: time + 1 });
      } else {
        this.clearTimer();
        this.stopRecording(true);
      }
    }, 1000);
  }

  stopRecording = (save) => {
    this.cancelRecording();
    window.dispatchEvent(new CustomEvent('stopRecording'));
    this.videoRecorder.stopRecording(url => {
      if (save) {
        this.videoRecorder.getDataURL(data => {
          this.props.onClose(url, data);
        });
      }
    });
  }

  renderRecTime = () => {
    const { status, time } = this.state;
    if (status === READY) {
      return time;
    }
    return time < 10 ? `0 : 0${time}` : `0 : ${time}`;
  }

  render() {
    const { videoUrl } = this.props;
    const { status, cameraUrl } = this.state;
    return (
      <Modal show onHide={this.onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{videoUrl ? 'Pitch' : 'Record Pitch'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.videoContainer}>
            <video
              preload="auto"
              controls={!!videoUrl}
              autoPlay
              src={videoUrl || cameraUrl}
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
          {
            cameraUrl &&
            <div className={styles.buttons}>
              {
                status === NONE &&
                <Button
                  bsStyle="success"
                  onClick={this.readyRecording}
                >Record</Button>
              }
              {
                status === READY &&
                <Button
                  bsStyle="warning"
                  onClick={this.cancelRecording}
                >Ready</Button>
              }
              {
                status === RECORDING &&
                <Button
                  bsStyle="danger"
                  onClick={() => this.stopRecording(true)}
                >Stop</Button>
              }
            </div>
          }
        </Modal.Body>
      </Modal>
    );
  }
}
