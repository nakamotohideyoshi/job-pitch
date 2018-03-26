import React from 'react';
import { Wrapper, VideoContainer } from './Wrapper';

export default ({ videoUrl, onClose }) => (
  <Wrapper title="Video Player" visible maskClosable={false} footer={null} onCancel={() => onClose()}>
    <VideoContainer>
      <video preload="auto" controls autoPlay src={videoUrl}>
        <track kind="captions" />
      </video>
    </VideoContainer>
  </Wrapper>
);
