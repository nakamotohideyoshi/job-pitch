import React from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';

const Wrapper = styled(Modal)`
  width: 648px !important;

  .ant-modal-body {
    position: relative;
  }
`;

const VideoContainer = styled.div`
  position: relative;

  video {
    width: 100%;
    background-color: #000;
  }
`;

export default ({ videoUrl, onClose }) => (
  <Wrapper title="Video Player" visible maskClosable={false} footer={null} onCancel={() => onClose()}>
    <VideoContainer>
      <video preload="auto" controls autoPlay src={videoUrl}>
        <track kind="captions" />
      </video>
    </VideoContainer>
  </Wrapper>
);
