import styled from 'styled-components';
import { Modal } from 'antd';
import colors from 'utils/colors';

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

      span {
        display: inline-block;
        width: 40px;
        font-size: 12px;
      }
    }

    .ant-progress-inner {
      background-color: rgba(0, 0, 0, 0.5);

      .ant-progress-bg {
        background-color: ${colors.yellow};
      }

      .ant-progress-text {
        color: #fff;
      }
    }
  }
`;
