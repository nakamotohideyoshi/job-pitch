import React from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';
import VideoPlayer from './Player';

const Wrapper = styled(Modal)`
  .ant-modal-content {
    background-color: transparent;
    box-shadow: none;

    .ant-modal-close-x {
      color: #999;
      &:hover {
        color: #ccc;
      }
    }

    .ant-modal-body {
      padding: 40px;
    }
  }
`;

export default ({ onClose, ...rest }) => (
  <Wrapper visible maskClosable={false} footer={null} width="720px" onCancel={() => onClose()}>
    <VideoPlayer {...rest} />
  </Wrapper>
);
