import styled from 'styled-components';
import { Modal } from 'antd';
import media from 'utils/mediaquery';

export default styled(Modal)`
  width: auto !important;

  .ant-modal-header {
    border-bottom: none;
  }

  .content {
    padding-bottom: 40px;

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
        margin-left: 50px;
        width: 200px;
        .ant-btn {
          width: 100%;
          margin-top: 25px;
        }
      }
    }
  `};

  ${media.tablet`
    .buttons { 
      padding-top: 25px;
    }
    .ant-btn {
      width: 150px;
      margin-right: 25px;
    }
  `};
`;
