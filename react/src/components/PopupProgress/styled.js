import styled from 'styled-components';
import { Modal } from 'antd';

export const Wrapper = styled(Modal)`
  &.ant-modal {
    width: 75% !important;
    max-width: 400px;
  }

  .ant-modal-content {
    background-color: transparent;
    box-shadow: none;
    text-align: center;

    label {
      color: #fff;
    }

    .ant-progress-inner {
      background-color: rgba(0, 0, 0, 0.5);

      .ant-progress-bg {
        background-color: #ff9300;
      }

      .ant-progress-text {
        color: #fff;
      }
    }
  }
`;
