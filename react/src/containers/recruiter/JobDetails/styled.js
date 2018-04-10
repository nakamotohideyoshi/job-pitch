import styled from 'styled-components';
import { Modal } from 'antd';
import media from 'utils/mediaquery';

export default styled(Modal)`
  width: auto !important;
  margin-bottom: 50px !important;

  .ant-modal-header {
    padding: 40px 40px 0 40px;
    border-bottom: none;
  }

  .ant-modal-body {
    padding: 40px;
  }

  .content {
    .buttons {
      .ant-switch {
        margin-left: 8px;
      }
    }
  }

  ${media.nottablet`
    .content {
      display: flex;

      .job-detail {
        flex: 1;
      }

      .buttons {
        width: 150px;
        margin-left: 30px;

        .ant-btn {
          margin-top: 20px;
          width: 100%;
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
