import styled from 'styled-components';
import { Modal } from 'antd';

export const Wrapper = styled(Modal)`
  width: 648px !important;

  .ant-modal-body {
    position: relative;
  }
`;

export const VideoContainer = styled.div`
  position: relative;

  video {
    width: 100%;
    background-color: #000;
  }
`;
