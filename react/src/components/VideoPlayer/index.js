import React from 'react';
import { ModalHeader, ModalBody } from 'reactstrap';
import Wrapper from './Wrapper';

export default ({ videoUrl, onClose }) => (
  <Wrapper isOpen size="lg">
    <ModalHeader toggle={() => onClose()}>Video Player</ModalHeader>
    <ModalBody>
      <div className="videoContainer">
        <video preload="auto" controls autoPlay src={videoUrl}>
          <track kind="captions" />
        </video>
      </div>
    </ModalBody>
  </Wrapper>
);
