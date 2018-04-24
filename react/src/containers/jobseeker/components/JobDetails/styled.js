import styled from 'styled-components';
import { Modal } from 'antd';
import media from 'utils/mediaquery';

export default styled(Modal)`
  width: auto !important;
  margin-bottom: 50px !important;

  .ant-modal-header {
    padding: 40px 40px 0 40px;
    border-bottom: none;

    .ant-modal-title {
      font-size: 24px;
    }
  }

  .ant-modal-body {
    padding: 40px;
  }

  ${media.nottablet`
    .content {
      display: flex;

      .details {
        flex: 1;
      }

      .buttons {
        display: flex;
        flex-direction: column;

        .ant-btn {
          width: 150px;
          margin-left: 30px;
          margin-top: 20px;
        }
      }
    }
  `};

  ${media.tablet`
    .buttons {
      .ant-btn {
        margin-top: 25px;
        width: 150px;
        margin-right: 25px;
      }
    }
  `};
`;
