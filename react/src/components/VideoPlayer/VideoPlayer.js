import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-bootstrap/lib/Modal';
import styles from './VideoPlayer.scss';

export default class VideoPlayer extends Component {
  static propTypes = {
    videoUrl: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  }

  render() {
    const { videoUrl, onClose } = this.props;
    return (
      <Modal show onHide={onClose} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Video Player</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.videoContainer}>
            <video
              preload="auto"
              controls
              autoPlay
              src={videoUrl}
            >
              <track kind="captions" />
            </video>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}
